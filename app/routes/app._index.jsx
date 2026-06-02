
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useNavigate } from "react-router";

export default function Index() {
   const navigate = useNavigate();
  return (
    <s-page heading="Discount App">
     <s-section padding="base" gap="200" alignItems="center" justifyContent="center">
       <s-stack direction="block" gap="base" alignItems="center" justifyContent="center">
          <s-text >create your discount </s-text>
          <s-stack direction="block" gap="base" alignItems="center" justifyContent="center">
               <s-button onClick={() => navigate("/app/discount-types")} variant="primary">
                  Customise
                </s-button>
          </s-stack>
        </s-stack>
     </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
