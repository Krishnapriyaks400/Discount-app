import { useState } from "react";
import { useFetcher } from "react-router";
import { authenticate } from "../shopify.server";

const PAGE_SIZE = 5;

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const url = new URL(request.url);
  if (!url.searchParams.has("fetch")) {
    return { products: null, pageInfo: null };
  }

  const cursor = url.searchParams.get("cursor");
  const direction = url.searchParams.get("direction") ?? "next";

  // Forward pagination uses first+after, backward uses last+before
  const variables =
    direction === "prev"
      ? { last: PAGE_SIZE, before: cursor }
      : { first: PAGE_SIZE, after: cursor };

  const res = await admin.graphql(
    `#graphql
    query getProducts($first: Int, $last: Int, $after: String, $before: String) {
      products(first: $first, last: $last, after: $after, before: $before) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          cursor
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
          }
        }
      }
    }`,
    { variables },
  );

  const { data } = await res.json();
  return {
    products: data.products.edges.map((e) => e.node),
    pageInfo: data.products.pageInfo,
  };
};

export default function AdditionalPage() {
  const fetcher = useFetcher();
  const products = fetcher.data?.products ?? [];
  const pageInfo = fetcher.data?.pageInfo ?? null;
  const isLoading = fetcher.state === "loading";
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleProduct = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const loadProducts = (cursor = null, direction = "next") => {
    const params = new URLSearchParams({ fetch: "true" });
    if (cursor) {
      params.set("cursor", cursor);
      params.set("direction", direction);
    }
    fetcher.load(`/app/additional?${params}`);
  };

  return (
    <s-page heading="Discount page">
      <s-section heading="Create discounts">
        <form>
          <s-stack direction="block" gap="base">
            <s-text-field
              label="Title"
              name="title"
              placeholder="e.g. Summer Sale"
              required
            />
            <s-text-field
              label="Discount code"
              name="code"
              placeholder="e.g. SAVE10"
              help-text="Customers enter this at checkout to activate the discount"
              required
            />
          </s-stack>
        </form>
      </s-section>

      <s-section heading="Select Products">
        <s-stack direction="block" gap="base">
          <s-button
            variant="secondary"
            onClick={() => loadProducts()}
            {...(isLoading ? { loading: true } : {})}
          >
            Get products
          </s-button>

          {products.length > 0 && (
            <>
              {selectedIds.size > 0 && (
                <s-text tone="subdued">
                  {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""} selected
                </s-text>
              )}
              <s-stack direction="block" gap="tight">
                {products.map((product) => (
                  <s-box
                    key={product.id}
                    padding="base"
                    borderWidth="base"
                    borderRadius="base"
                    background={selectedIds.has(product.id) ? "subdued" : undefined}
                  >
                    <s-stack direction="inline" gap="base">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleProduct(product.id)}
                      />
                      {product.featuredImage && (
                        <img
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText ?? product.title}
                          width={48}
                          height={48}
                          style={{ objectFit: "cover", borderRadius: 4 }}
                        />
                      )}
                      <s-stack direction="block" gap="none">
                        <s-text fontWeight="bold">{product.title}</s-text>
                        <s-text tone="subdued">
                          ${product.variants.edges[0]?.node.price}
                        </s-text>
                      </s-stack>
                    </s-stack>
                  </s-box>
                ))}
              </s-stack>

              <s-stack direction="inline" gap="base">
                <s-button
                  variant="secondary"
                  disabled={!pageInfo?.hasPreviousPage}
                  onClick={() => loadProducts(pageInfo.startCursor, "prev")}
                >
                  Previous
                </s-button>
                <s-button
                  variant="secondary"
                  disabled={!pageInfo?.hasNextPage}
                  onClick={() => loadProducts(pageInfo.endCursor, "next")}
                >
                  Next
                </s-button>
              </s-stack>
           
            </>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}
