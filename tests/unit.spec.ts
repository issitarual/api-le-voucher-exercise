import createVoucher from "../src/services/voucherService";
import voucherRepository from "../src/repositories/voucherRepository";
import { conflictError } from "utils/errorUtils";

describe("create voucher", () => {
  const code = "test123456";
  const discount = 50;
  const voucherExistResponse = "Voucher already exist.";
  it("shouldn't create existent voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return code;
      });

    const response = await createVoucher.createVoucher(code, discount);
    expect(response).toBeInstanceOf(conflictError);
    expect(response).toEqual(voucherExistResponse);
  });
  it("should create voucher correctly", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return null;
      });

    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => {
        return null;
      });

    const response = await createVoucher.createVoucher(code, discount);
    expect(response).toBe(undefined);
    expect(response).not.toBeInstanceOf(conflictError);
  });
});

describe("apply voucher", () => {
  const code = "test123456";
  const discount = 50;
  const minAmount = 101;
  const voucherNotExistResponse = "Voucher does not exist.";
  it("shouldn't apply non-existent voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return null;
      });

    const response = await createVoucher.applyVoucher(code, minAmount);
    expect(response).toBeInstanceOf(conflictError);
    expect(response).toEqual(voucherNotExistResponse);
  });

  it("should apply a valid voucher", async () => {
    const finalAmount = minAmount - minAmount * (discount / 100);
    const expectedResponse = {
      amount: minAmount,
      discount,
      finalAmount,
      applied: finalAmount !== minAmount,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return { code, used: false };
      });

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        return code;
      });

    const response = await createVoucher.applyVoucher(code, minAmount);
    expect(response).toEqual(expectedResponse);
  });
});
