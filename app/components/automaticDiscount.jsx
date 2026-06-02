/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

export default function AutomaticDiscount() {
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState("");
  const [active, setActive] = useState("true");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const fetcher = useFetcher();

  const isLoading = fetcher.state === "submitting";
  const serverErrors = fetcher.data?.errors ?? [];
  const success = fetcher.data?.success;
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const saveDiscount = () => {
    const newErrors = {};
    if (!name.trim())  newErrors.name  = "Discount name is required";
    if (!value.trim()) newErrors.value = "Discount value is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const formData = new FormData();
    formData.set("name", name);
    formData.set("type", type);
    formData.set("value", value);
    formData.set("active", active);
    fetcher.submit(formData, { method: "POST" });
  };

  return (
    <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
      <s-grid-item gridColumn="span 8" gridRow="span 1">
        <s-section>
          <s-text>Automatic Discount</s-text>

          {showSuccess && (
            <s-banner tone="success">Discount created successfully!</s-banner>
          )}
         
          {serverErrors.length > 0 && (
            <s-banner tone="critical">
              {serverErrors.map((e) => e.message).join(" · ")}
            </s-banner>
          )}

          <s-section>
            <form>
              <s-stack paddingBlockEnd="base" gap="tight">
                <s-text-field
                  label="Discount Name"
                  placeholder="e.g. Summer Sale"
                  value={name}
                  error={errors.name}
                  onChange={(e) => setName(e.target.value)}
                />
              </s-stack>

              <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                <s-grid-item gridColumn="span 6" gridRow="span 1">
                  <s-select
                    label="Discount Type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <s-option value="percentage">Percentage</s-option>
                    <s-option value="fixed">Fixed Amount</s-option>
                  </s-select>
                </s-grid-item>

                <s-grid-item gridColumn="span 6" gridRow="span 1">
                  {type === "percentage" ? (
                    <s-number-field
                      label="Discount Percentage"
                      prefix="%"
                      placeholder="10"
                      value={value}
                      error={errors.value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  ) : (
                    <s-money-field
                      label="Fixed Amount"
                      placeholder="20.00"
                      value={value}
                      error={errors.value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  )}
                </s-grid-item>
              </s-grid>
            </form>
          </s-section>
        </s-section>
      </s-grid-item>

      <s-grid-item gridColumn="span 4" gridRow="span 1">
        <s-stack gap="base">
          <s-section>
            <s-select
              label="Status"
              value={active}
              onChange={(e) => setActive(e.target.value)}
            >
              <s-option value="true">Active</s-option>
              <s-option value="false">Inactive</s-option>
            </s-select>
             <s-section>Show in product page</s-section>
          </s-section>

          <s-section heading="Discount details">
            <s-stack gap="base" paddingBlockStart="base">
              <s-text>Name: {name || ""}</s-text>
              <s-text>Type: {type === "percentage" ? "Percentage" : "Fixed Amount"}</s-text>
              <s-text>
                Value: {value || ""}{value ? (type === "percentage" ? "%" : "$") : ""}
              </s-text>
              <s-text>Status: {active === "true" ? "Active" : "Inactive"}</s-text>
            </s-stack>
            <s-stack paddingBlockStart="base">
              <s-button
                variant="primary"
                fullWidth
                onClick={saveDiscount}
                {...(isLoading ? { loading: true } : {})}
              >
                Save Discount
              </s-button>
            </s-stack>
          </s-section>
        </s-stack>
      </s-grid-item>
    </s-grid>
  );
}
