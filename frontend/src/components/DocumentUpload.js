import { useRef, useState } from "react";
import { toast } from "react-toastify";

export default function DocumentUpload() {

  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  //const [status, setStatus] = useState("");

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    //const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];

    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (fileExtension !== ".pdf" ) {
      toast.error("Unsupported file type. Please upload a PDF file.");
      e.target.value = null;
      return;
    }

    setFileName(file.name);
    uploadFile(file);

    e.target.value = null;
  };


  const uploadFile = async (file) => {

    const formData = new FormData();
    formData.append("file", file);

    try {
      //setStatus("Uploading...");
      toast.info("Uploading document...");

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      //setStatus("Document uploaded. You can now ask questions.");
      toast.success(`Document "${file.name}" uploaded successfully`);
    } catch (error) {
      console.error(error);
      //setStatus("Upload failed");
      toast.error("Failed to upload document.");
    }
  };

  return (
    <div className="upload-container">


      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
      />

      {/* Upload Icon */}
      <button className="upload-icon-btn" onClick={handleIconClick}>
        +
      </button>

      {/* {fileName && <p>Selected file: {fileName}</p>} */}

      {/* <p className="upload-status">{status}</p> */}

    </div>
  );
}