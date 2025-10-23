import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Alert } from "../components/common";

interface ErrorState {
  message: string | null;
  type: "info" | "success" | "warning" | "error" | null;
}

type ErrorAction =
  | {
      type: "SHOW_ERROR";
      payload: {
        message: string;
        type?: "info" | "success" | "warning" | "error";
      };
    }
  | { type: "HIDE_ERROR" };

const ErrorStateContext = createContext<ErrorState | undefined>(undefined);
const ErrorDispatchContext = createContext<
  React.Dispatch<ErrorAction> | undefined
>(undefined);

const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case "SHOW_ERROR":
      return {
        message: action.payload.message,
        type: action.payload.type || "error",
      };
    case "HIDE_ERROR":
      return {
        message: null,
        type: null,
      };
    default:
      return state;
  }
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, {
    message: null,
    type: null,
  });

  return (
    <ErrorStateContext.Provider value={state}>
      <ErrorDispatchContext.Provider value={dispatch}>
        {children}
        {state.message && (
          <div className="error-container">
            <Alert
              type={state.type as "info" | "success" | "warning" | "error"}
              message={state.message}
              onClose={() => dispatch({ type: "HIDE_ERROR" })}
              showIcon
            />
          </div>
        )}
      </ErrorDispatchContext.Provider>
    </ErrorStateContext.Provider>
  );
};

export const useErrorState = () => {
  const context = useContext(ErrorStateContext);
  if (context === undefined) {
    throw new Error("useErrorState 必须在 ErrorProvider 内使用");
  }
  return context;
};

export const useErrorDispatch = () => {
  const context = useContext(ErrorDispatchContext);
  if (context === undefined) {
    throw new Error("useErrorDispatch 必须在 ErrorProvider 内使用");
  }
  return context;
};
