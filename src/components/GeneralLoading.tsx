import { Spin } from "antd";

type Props = {
  isLoading: boolean;
};

export default function GeneralLoading({ isLoading }: Props) {
  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <Spin size="large" />
        </div>
      )}
    </>
  );
}
