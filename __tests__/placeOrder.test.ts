import { placeOrder } from "@/app/checkout/actions";

const rpc = jest.fn();
const createCheckoutSession = jest.fn();
const releaseOrder = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc }),
}));
jest.mock("@/lib/stripe-checkout", () => ({
  createCheckoutSession: (...args: unknown[]) => createCheckoutSession(...args),
  releaseOrder: (...args: unknown[]) => releaseOrder(...args),
}));

const ID = "d968f9b4-c8f1-493d-82cf-9be6a73df467";
const valid = {
  email: "a@b.com",
  name: "Jane Doe",
  address: "1 Main St",
  city: "Austin",
  postalCode: "73301",
  country: "US",
  items: { [ID]: 2 },
};

describe("placeOrder", () => {
  beforeEach(() => {
    rpc.mockReset();
    createCheckoutSession.mockReset();
    releaseOrder.mockReset().mockResolvedValue(undefined);
  });

  it("rejects missing required fields", async () => {
    const result = await placeOrder({ ...valid, city: "  " });
    expect(result).toEqual({
      ok: false,
      error: "Please fill in all required fields.",
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects an unsupported country", async () => {
    const result = await placeOrder({ ...valid, country: "ZZ" });
    expect(result).toEqual({ ok: false, error: "Please choose a valid country." });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects an empty or invalid bag", async () => {
    const result = await placeOrder({
      ...valid,
      items: { "not-a-uuid": 1, [ID]: 0 },
    });
    expect(result).toEqual({ ok: false, error: "Your bag is empty." });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("sends only valid items and returns the Stripe payment URL", async () => {
    rpc.mockResolvedValue({ data: "order-123", error: null });
    createCheckoutSession.mockResolvedValue("https://checkout.stripe.com/pay/cs_test_1");
    const result = await placeOrder({
      ...valid,
      items: { [ID]: 2, "bad-id": 5 },
    });
    expect(result).toEqual({
      ok: true,
      url: "https://checkout.stripe.com/pay/cs_test_1",
    });
    expect(createCheckoutSession).toHaveBeenCalledWith("order-123", "a@b.com");
    expect(rpc).toHaveBeenCalledWith(
      "place_order",
      expect.objectContaining({
        p_email: "a@b.com",
        p_name: "Jane Doe",
        p_country_code: "US",
        p_items: [{ product_id: ID, quantity: 2 }],
      }),
    );
  });

  it("releases the order if Stripe fails", async () => {
    rpc.mockResolvedValue({ data: "order-123", error: null });
    createCheckoutSession.mockRejectedValue(new Error("stripe down"));
    const result = await placeOrder(valid);
    expect(result).toEqual({
      ok: false,
      error: "We couldn't start the payment. Please try again.",
    });
    expect(releaseOrder).toHaveBeenCalledWith("order-123");
  });

  it("returns the database error message", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "Not enough stock for Green Top" },
    });
    const result = await placeOrder(valid);
    expect(result).toEqual({
      ok: false,
      error: "Not enough stock for Green Top",
    });
  });
});
