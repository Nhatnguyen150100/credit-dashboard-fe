import React, { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { message, Button, Tooltip, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Visibility from "./Visibility";

interface IProps {
  imgProps: string | null;
  file: File | undefined;
  handleUploadFile: (file: File | undefined) => void;
}

const styleImg = {
  border: "2px dashed #d9d9d9",
  borderRadius: "12px",
  padding: "16px",
  height: "240px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f8f8f8",
  color: "#999",
  textAlign: "center",
  cursor: "pointer",
  overflow: "hidden",
};

export default function ImgUpload({
  imgProps,
  file,
  handleUploadFile,
}: IProps) {
  const onDrop = (acceptedFiles: File[]) => {
    if (file) {
      message.error("Chỉ có thể tải lên một file duy nhất.");
      return;
    }

    const droppedFile = acceptedFiles[0];
    if (droppedFile) {
      handleUploadFile(droppedFile);
      message.success(`Tải lên thành công: ${droppedFile.name}`);
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    let pastedFile: File | null = null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        pastedFile = item.getAsFile();
        break;
      }
    }

    if (file) {
      message.error("Chỉ có thể tải lên một file duy nhất.");
      return;
    }

    if (pastedFile) {
      handleUploadFile(pastedFile);
      message.success(`Tải lên thành công: ${pastedFile.name}`);
    }
  };

  const thumb = useMemo(() => {
    if (!(file || imgProps)) return <></>;
    return (
      <div className="border-dashed border-[2px] border-[#d9d9d9] h-[240px] relative">
        <Tooltip title="Xóa ảnh">
          <Button
            className="ms-3 absolute right-0"
            variant="solid"
            color="danger"
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => {
              handleUploadFile(undefined);
            }}
          />
        </Tooltip>
        <img
          crossOrigin="anonymous"
          className="h-full w-full object-contain rounded"
          src={file ? URL.createObjectURL(file) : imgProps ?? undefined}
          onLoad={() => {
            file ? URL.revokeObjectURL(URL.createObjectURL(file)) : imgProps;
          }}
        />
      </div>
    );
  }, [file, imgProps]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop,
  });

  return (
    <>
      <Visibility visibility={!(file || imgProps)} suspenseComponent={thumb}>
        <div
          {...getRootProps()}
          className="hover:border-slate-700"
          style={styleImg as any}
        >
          <input {...getInputProps()} />
          <p>Tải ảnh</p>
        </div>
        <Input
          type="text"
          onPaste={handlePaste}
          placeholder="Dán ảnh đã sao chép tại đây"
          style={{ width: "100%", height: "40px" }}
        />
      </Visibility>
    </>
  );
}
