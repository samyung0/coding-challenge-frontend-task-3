import { SiweError, SiweMessage } from "siwe";

export async function POST(req: Request) {
  const { message, signature } = await req.json();
  const siweMessage = new SiweMessage(message);
  try {
    const res = await siweMessage.verify({ signature });
    return Response.json({
      success: res.success,
      error: res.error?.type,
    });
  } catch (e) {
    if (e instanceof SiweError) {
      return Response.json({
        success: false,
        error: e.type,
      });
    }
  }
}
