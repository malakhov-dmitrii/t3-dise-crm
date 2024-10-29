import { AnyToVoidFunction, throttle, throttleWith } from "@/lib/utils";
import { Scheduler } from "../../../telegram-tt/src/util/schedulers";
import { useCallback, useMemo } from "react";

export default function useThrottledCallback<T extends AnyToVoidFunction>(
  fn: T,
  deps: unknown[],
  msOrSchedulerFn: number | Scheduler,
  noFirst = false,
) {
  const fnMemo = useCallback(fn, deps);

  return useMemo(() => {
    if (typeof msOrSchedulerFn === "number") {
      return throttle(fnMemo, msOrSchedulerFn, !noFirst);
    } else {
      return throttleWith(msOrSchedulerFn, fnMemo);
    }
  }, [fnMemo, msOrSchedulerFn, noFirst]);
}
