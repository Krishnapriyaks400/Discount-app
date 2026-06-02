
import { useState, useRef, useEffect } from "react";



function Badge({ text, color }) {
  return (
    <span style={{
      background: color,
      color: "#fff",
      padding: "4px 12px",
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}>
      {text}
    </span>
  );
}


const browserBar = (
  <div style={{
    background: "#f6f6f7",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderBottom: "1px solid #e1e3e5",
  }}>
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
    <div style={{
      flex: 1, background: "#fff", borderRadius: 4,
      padding: "2px 8px", fontSize: 11, color: "#8c9196",
      marginLeft: 8, border: "1px solid #e1e3e5",
    }}>
      mystore.myshopify.com/products/sample
    </div>
  </div>
);

const imagePlaceholder = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

function ProductInfo({ badgeText, badgeColor, isActive, position }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        {isActive && position === "outside" && 
        <Badge text={badgeText} color={badgeColor} />}
        <span style={{ fontSize: 12, color: "#8c9196" }}>Sample Brand</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#202223", marginBottom: 4 }}>
        Sample Product Name
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#202223" }}>$49.99</span>
        {isActive && (
          <span style={{ fontSize: 13, color: "#8c9196", textDecoration: "line-through" }}>$69.99</span>
        )}
      </div>
      <div style={{
        background: "#008060", color: "#fff", textAlign: "center",
        padding: "9px", borderRadius: 6, fontWeight: 600, fontSize: 13,
      }}>
        Add to cart
      </div>
    </>
  );
}


function MobilePreview({ badgeText, badgeColor, isActive, position }) {
  return (
    <div style={{
      border: "1px solid #e1e3e5", borderRadius: 12,
      overflow: "hidden", background: "#fff", fontFamily: "sans-serif", width: 280,
    }}>
      {browserBar}
      <div style={{
        background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
        height: 180, display: "flex", alignItems: "center",
        justifyContent: "center", position: "relative",
      }}>
        {imagePlaceholder}
        {isActive && position === "inside" && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <Badge text={badgeText} color={badgeColor} />
          </div>
        )}
      </div>
      <div style={{ padding: 14 }}>
        <ProductInfo badgeText={badgeText} badgeColor={badgeColor} isActive={isActive} position={position} />
      </div>
    </div>
  );
}


function DesktopPreview({ badgeText, badgeColor, isActive, position }) {
  return (
    <div style={{
      border: "1px solid #e1e3e5", borderRadius: 12,
      overflow: "hidden", background: "#fff", fontFamily: "sans-serif", width: 560,
    }}>
      {browserBar}
      <div style={{
        padding: "10px 20px", borderBottom: "1px solid #e1e3e5",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#202223" }}>MyStore</span>
        <div style={{ display: "flex", gap: 16 }}>
          {["Home", "Products", "About"].map((item) => (
            <span key={item} style={{ fontSize: 12, color: "#8c9196" }}>{item}</span>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#8c9196" }}>🛒 Cart (0)</span>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{
          width: "55%", background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
          minHeight: 260, display: "flex", alignItems: "center",
          justifyContent: "center", position: "relative",
        }}>
          {imagePlaceholder}
          {isActive && position === "inside" && (
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <Badge text={badgeText} color={badgeColor} />
            </div>
          )}
        </div>
        <div style={{ width: "45%", padding: "20px 18px" }}>
          <ProductInfo badgeText={badgeText} badgeColor={badgeColor} isActive={isActive} position={position} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e1e3e5" }}>
            <span style={{ fontSize: 11, color: "#8c9196" }}>Free shipping on orders over $50</span>
          </div>
        </div>
      </div>
    </div>
  );
}



function ProductPagePreview({ badgeText, badgeColor, isActive, position }) {
  const [view, setView] = useState("desktop");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["desktop", "mobile"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "4px 14px", borderRadius: 6, border: "1px solid #e1e3e5",
              background: view === v ? "#202223" : "#fff",
              color: view === v ? "#fff" : "#202223",
              fontWeight: 600, fontSize: 12, cursor: "pointer",
            }}
          >
            {v === "desktop" ? "🖥 Desktop" : "📱 Mobile"}
          </button>
        ))}
      </div>
      {view === "desktop" ? (
        <DesktopPreview badgeText={badgeText} badgeColor={badgeColor} isActive={isActive} position={position} />
      ) : (
        <MobilePreview badgeText={badgeText} badgeColor={badgeColor} isActive={isActive} position={position} />
      )}
    </div>
  );
}





export default function ProductBadge() {
  const [badgeText, setBadgeText] = useState("SALE");
  const [badgeColor, setBadgeColor] = useState("#2e7d32");
  const [isActive, setIsActive] = useState('active');
  const [position, setPosition] = useState("inside");
  const positionRef = useRef(null);

  useEffect(() => {
    const el = positionRef.current;
    if (!el) return;
    const handler = (e) => {
      const value = e.detail?.value ?? e.detail ?? e.target.value;
      if (value) setPosition(value);
    };
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, []);

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>

      {/* Left: controls */}
      <div style={{ flex: 1, minWidth: 260 }}>
        <s-stack direction="block" gap="base">
          <s-text-field
            label="Badge text"
            value={badgeText}
            onInput={(e) => setBadgeText(e.target.value)}
            placeholder="e.g. SALE"
          />

          <s-stack direction="block" gap="tight">
            <s-text fontWeight="semibold">Badge colour</s-text>
            <s-box padding="base" borderWidth="base" borderRadius="base">
              <s-color-picker
                value={badgeColor}
                onClick={(e) => setBadgeColor(e.target.value)}
                name="badge-color"
              />
            </s-box>
          </s-stack>

          <s-choice-list
            ref={positionRef}
            label="Badge Position"
            name="position"
            value={position}
          >
            <s-choice value="inside">Inside image</s-choice>
            <s-choice value="outside">Outside image</s-choice>
          </s-choice-list>

          <s-stack direction="inline" gap="base" blockAlignment="center">
            <s-switch
                label="Badge active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
            ></s-switch>
          </s-stack>
        </s-stack>
      </div>

      {/* Right: product page preview */}
      <div style={{ flexShrink: 0, minWidth: 280 }}>
        <s-text tone="subdued" fontWeight="semibold">Storefront preview</s-text>
        <div style={{ marginTop: 8 }}>
          <ProductPagePreview
            badgeText={badgeText}
            badgeColor={badgeColor}
            isActive={isActive}
            position={position}
          />
        </div>
      </div>
    </div>
  );
}
