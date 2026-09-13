export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    documentName?: string;
  };
  return Response.json({
    documentName: body.documentName || "Priya_Payslip_August_2026.pdf",
    fields: {
      employer: { value: "Nordlicht Systems GmbH", confidence: 0.99 },
      period: { value: "August 2026", confidence: 0.99 },
      grossSalary: { value: "6100", confidence: 0.98 },
      taxClass: { value: "I", confidence: 0.96 },
      healthInsurance: { value: "TK", confidence: 0.91 },
      netPay: { value: "3652.84", confidence: 0.97 },
    },
    mode: "prototype",
  });
}
