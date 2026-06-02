
import { useState } from "react";
import AutomaticDiscount from "../components/automaticDiscount";
import ProductBadge from "../components/ProductBadge";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const name = form.get("name");
  const type = form.get("type");
  const rawValue = parseFloat(form.get("value"));

  const discountValue =
    type === "percentage"
      ? { percentage: rawValue / 100 }
      : { discountAmount: { amount: rawValue.toFixed(2), appliesOnEachItem: false } };

  const res = await admin.graphql(
    `#graphql
    mutation discountAutomaticBasicCreate($discount: DiscountAutomaticBasicInput!) {
      discountAutomaticBasicCreate(automaticBasicDiscount: $discount) {
        automaticDiscountNode {
          id
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              title
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
        discount: {
          title: name,
          startsAt: new Date().toISOString(),
          customerGets: {
            value: discountValue,
            items: { all: true },
          },
        },
      },
    },
  );

  const { data } = await res.json();
  const { automaticDiscountNode, userErrors } = data.discountAutomaticBasicCreate;

  if (userErrors.length > 0) {
    return { errors: userErrors };
  }

  return { success: true, discountId: automaticDiscountNode.id };
};

export default function discountTypes() {
    const [selectedOpt, setSelectedOpt] = useState("automaticProductDiscounts");
  return (
    <s-page heading="Discount Types">
        <s-grid gridTemplateColumns="repeat(8, 1fr)" gap="base">
        <s-grid-item gridColumn="span 4" gridRow="span 1">
            <s-section onClick={() => setSelectedOpt("automaticProductDiscounts")}>
            <s-text>
                Automatic Product Discount
            </s-text>
            </s-section>
        </s-grid-item>
        <s-grid-item gridColumn="span 4" gridRow="span 1">
            <s-section onClick={() => setSelectedOpt("customiseProductBadge")}>
            <s-text>
                Customise Product badge
            </s-text>
            </s-section>
        </s-grid-item>
        </s-grid>
        <s-divider />
        <s-stack gap="large-100" paddingBlockStart="large-400">
        {selectedOpt === "automaticProductDiscounts" && (
            <AutomaticDiscount />
        )}
        {selectedOpt === "customiseProductBadge" && (
            <ProductBadge />
        )}
        </s-stack>
    </s-page>
  )
}
