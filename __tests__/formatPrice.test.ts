import { formatPrice } from "@/lib/products";

describe("formatPrice", () => {
  it("formats whole amounts with cents", () => {
    expect(formatPrice(32)).toBe("$32.00");
  });

  it("keeps decimal cents", () => {
    expect(formatPrice(10.2)).toBe("$10.20");
    expect(formatPrice(35.5)).toBe("$35.50");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
});
