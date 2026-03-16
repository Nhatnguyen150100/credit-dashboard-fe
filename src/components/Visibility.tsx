import * as React from "react";

interface IVisibilityProps {
  visibility: unknown;
  children: React.ReactNode;
  suspenseComponent?: React.JSX.Element | null;
}

export default function Visibility({
  children,
  visibility,
  suspenseComponent = null,
}: IVisibilityProps) {
  return <>{visibility ? children : suspenseComponent}</>;
}
