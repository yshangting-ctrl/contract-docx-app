const parsedTimeoutMs = Number(process.env.EXTERNAL_API_TIMEOUT_MS || 15000);

export const externalApiTimeoutMs =
  Number.isFinite(parsedTimeoutMs) && parsedTimeoutMs > 0 ? parsedTimeoutMs : 15000;

const EXTERNAL_SERVICE_ERROR_CODE = "EXTERNAL_SERVICE_UNAVAILABLE";

function makeExternalServiceError(error, timedOut) {
  const message = timedOut
    ? `外部服务请求超时（${externalApiTimeoutMs}ms）`
    : "外部服务暂不可用，请稍后重试。";
  const wrapped = new Error(message, { cause: error });

  wrapped.name = "ExternalServiceError";
  wrapped.code = EXTERNAL_SERVICE_ERROR_CODE;
  wrapped.status = 503;
  return wrapped;
}

export async function fetchExternal(url, options = {}) {
  const controller = new AbortController();
  const callerSignal = options.signal;
  let timedOut = false;

  const onCallerAbort = () => controller.abort(callerSignal.reason);
  if (callerSignal) {
    if (callerSignal.aborted) {
      onCallerAbort();
    } else {
      callerSignal.addEventListener("abort", onCallerAbort, { once: true });
    }
  }

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, externalApiTimeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    throw makeExternalServiceError(error, timedOut);
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", onCallerAbort);
  }
}

export function isExternalServiceError(error) {
  return error?.code === EXTERNAL_SERVICE_ERROR_CODE;
}
