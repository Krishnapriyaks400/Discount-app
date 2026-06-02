import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useRouteError } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const res = await admin.graphql(`
    #graphql
    query getShopifyFunctions {
      shopifyFunctions(first: 25) {
        nodes {
          id
          apiType
        }
      }
    }
  `);

  const { data } = await res.json();
  const fns = data.shopifyFunctions.nodes;

  // Both targets (cart lines and delivery options) belong to one compiled function
  const functionId = fns.find((f) => f.apiType === "discount")?.id ?? null;

  return { cartLinesFunctionId: functionId, deliveryFunctionId: functionId, fns };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const res = await admin.graphql(
    `#graphql
    mutation discountCodeAppCreate($codeAppDiscount: DiscountCodeAppInput!) {
      discountCodeAppCreate(codeAppDiscount: $codeAppDiscount) {
        codeAppDiscount {
          discountId
          title
          codes(first: 1) {
            nodes {
              code
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        codeAppDiscount: {
          title: form.get("title"),
          functionId: form.get("functionId"),
          startsAt: new Date().toISOString(),
          codes: [{ code: form.get("code") }],
          discountClasses: form.getAll("discountClasses"),
        },
      },
    },
  );

  const { data } = await res.json();
  const { codeAppDiscount, userErrors } = data.discountCodeAppCreate;

  if (userErrors.length > 0) {
    return { errors: userErrors };
  }
  return { discount: codeAppDiscount };
};

export default function Discounts() {
  const { cartLinesFunctionId, deliveryFunctionId, fns } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [discountType, setDiscountType] = useState("cart_lines");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const errors = fetcher.data?.errors ?? [];
  const discount = fetcher.data?.discount;

  const isShipping = discountType === "shipping";
  const functionId = isShipping ? deliveryFunctionId : cartLinesFunctionId;
  const discountClasses = isShipping ? ["SHIPPING"] : ["ORDER", "PRODUCT"];

  useEffect(() => {
    if (discount) shopify.toast.show("Discount created!");
  }, [discount, shopify]);

  const handleCreate = () => {
    const formData = new FormData();
    formData.set("title", title);
    formData.set("code", code);
    formData.set("functionId", functionId ?? "");
    for (const cls of discountClasses) {
      formData.append("discountClasses", cls);
    }
    fetcher.submit(formData, { method: "POST" });
  };

  return (
    <s-page heading="Create Discount Code">
      {errors.length > 0 && (
        <s-banner tone="critical">
          {errors.map((e) => e.message).join(" · ")}
        </s-banner>
      )}

      {discount && (
        <s-banner tone="success">
          Discount &quot;{discount.title}&quot; created — code:{" "}
          <strong>{discount.codes.nodes[0]?.code}</strong>
        </s-banner>
      )}

      <s-section heading="Discount details">
        <s-stack direction="block" gap="base">
          <s-text-field
            label="Title"
            value={title}
            onInput={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Sale"
            required
          />
          <s-text-field
            label="Discount code"
            value={code}
            onInput={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE10"
            help-text="Customers enter this at checkout to activate the discount"
            required
          />
        </s-stack>
      </s-section>

      <s-section heading="Discount type">
        <s-stack direction="block" gap="base">
          <s-paragraph>Select what this discount applies to:</s-paragraph>
          <s-stack direction="inline" gap="base">
            <s-button
              variant={!isShipping ? "primary" : "secondary"}
              onClick={() => setDiscountType("cart_lines")}
            >
              Order &amp; Product
            </s-button>
            <s-button
              variant={isShipping ? "primary" : "secondary"}
              onClick={() => setDiscountType("shipping")}
            >
              Free Shipping
            </s-button>
          </s-stack>
          <s-paragraph>
            {isShipping
              ? "Applies 100% off the first delivery group (free shipping)"
              : "Applies 10% off the order total and 20% off the most expensive item"}
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section>
        <s-button
          onClick={handleCreate}
          {...(isLoading ? { loading: true } : {})}
          disabled={!functionId}
        >
          Create discount
        </s-button>
        {!functionId && (
          <s-stack direction="block" gap="base">
            <s-paragraph>
              No matching Shopify Function found. Functions available from Shopify:
            </s-paragraph>
            <s-box padding="base" background="subdued" borderRadius="base">
              <pre style={{ margin: 0, fontSize: 12 }}>
                {JSON.stringify(fns, null, 2)}
              </pre>
            </s-box>
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
