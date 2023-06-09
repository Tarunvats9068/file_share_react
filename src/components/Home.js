import React, { useState, useEffect, useRef } from "react";
import Dropzone from "react-dropzone";
import axios from "axios";
import download from "downloadjs";
import logo from "../stylesheets/logo.png";
import "../stylesheets/home.css";

const baseURL = process.env.REACT_APP_BASEURL;
let frontURL = "https://easysharing.netlify.app";
const Home = () => {
    const dropRef = useRef(null);
    const submitBtn = useRef(null); 
    const finalLinkRef = useRef(null);
    const previewImgRef = useRef(null);
    const shareBtnRef = useRef(null); 
    const homeRef = useRef(null);
    const firstRender = useRef(true); 
    const [errorMsg, setErrorMsg] = useState(""); 
    const [file, setFile] = useState({}); 
    const [previewSrc, setPreviewSrc] = useState(""); 
    const [isPreviewAvailable, setIsPreviewAvailable] = useState(false);
    const [uploadedFile, setUploadedFile] = useState({});
    const [progress, setProgress] = useState(0);
    const [displayProgress, setDisplayProgress] = useState(false);
    const [displayLinks, setDisplayLinks] = useState(false);
    useEffect(() => {
        homeRef.current.style.opacity = "1";
    }, []);
    useEffect(() => {
        if (progress < 100 && displayProgress) {
            window.setTimeout(() => {
                setProgress(progress + 2);
            }, 100);
        }
        else if (uploadedFile.file && progress >= 99) {
            window.setTimeout(() => {
                setDisplayProgress(false); 
                setProgress(0); 
                setDisplayLinks(true);
                window.setTimeout(() => {
                    finalLinkRef.current.style.opacity = "1";
                }, 100);
            }, 1000);
        }
        else if (progress !== 0 && !uploadedFile.file) setProgress(99);
    }, [progress, displayProgress, uploadedFile]);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        } else {
            if (isPreviewAvailable && previewSrc) {
                previewImgRef.current.style.opacity = "1";
            }
            if (!isPreviewAvailable && file.name)
                dropRef.current.style.minHeight = "50vh";
            else if (isPreviewAvailable && file.name)
                dropRef.current.style.minHeight = "25vh";
            dropRef.current.style.border = "2px dashed #08a1c4";
            dropRef.current.style.background = "";
            dropRef.current.style.color = "";
        }
    }, [isPreviewAvailable, previewSrc, file]);
    useEffect(() => {
        if (file.name) {
            setErrorMsg("");
            if (submitBtn.current) {
                submitBtn.current.style.visibility = "visible";
                submitBtn.current.style.opacity = "1";
            }
        }
    }, [file]);
    const updateBorder = (dragState) => {
        if (dragState === "over") {
            dropRef.current.style.border = "2px solid #02B875";
            dropRef.current.style.background =
                "linear-gradient(315deg, #08a1c4 0%, #08cfbe 40%, #02b875 100%)";
            dropRef.current.style.color = "white";
        }
        else if (dragState === "leave") {
            dropRef.current.style.border = "2px dashed #08a1c4";
            dropRef.current.style.background = "";
            dropRef.current.style.color = "";
        }
    };
    const handleFile = (files) => {
        const [uploadedFile] = files;
        setFile(uploadedFile);
        setDisplayLinks(false);
        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewSrc(fileReader.result);
        };
        fileReader.readAsDataURL(uploadedFile);

        setIsPreviewAvailable(
            uploadedFile.name.match(/\.(jpeg|jpg|png|webp|gif|svg)$/)
        );
    };
    const handleBtnClick = (e) => {
        shareBtnRef.current.style.background =
            "linear-gradient(315deg, #08a1c4 0%, #08cfbe 40%, rgb(2, 184, 117, 0.9) 100%)";
        shareBtnRef.current.style.color = "white";
        window.setTimeout(() => {
            shareBtnRef.current.style.background = "";
            shareBtnRef.current.style.color = "";
        }, 200);
        navigator.clipboard.writeText(
            `${baseURL}/api/${uploadedFile.file._id}`
        );
        const toolTip = document.querySelector(
            "button.share-link .tooltiptext"
        );
        toolTip.style.visibility = "visible";
        toolTip.style.opacity = "1";
        window.setTimeout(() => {
            toolTip.style.visibility = "hidden";
            toolTip.style.opacity = "0";
        }, 5000);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        submitBtn.current.style.opacity = "0";
        if (file) {
            const formdata = new FormData();
            formdata.append("file", file);
            window.setTimeout(() => {
                setDisplayProgress(true);
            }, 500);
            axios
                .post(`${baseURL}/api/`, formdata, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((file) => {
                    setErrorMsg("");
                    submitBtn.current.style.visibility = "hidden";
                    axios
                        .get(`${baseURL}/api/${file.data._id}`)
                        .then((uploadedFile) => {
                            setDisplayLinks(true);
                            setUploadedFile(uploadedFile.data);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
                .catch((err) => {
                    if (!err.response) {
                        setErrorMsg(
                            "Please connect to the internet and try again."
                        );
                    }
                    else {
                        const offlineError =
                            "Error: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://docs.atlas.mongodb.com/security-whitelist/";
                        const fileSizeError = "File too large";
                        if (err.response.data === offlineError)
                            setErrorMsg(
                                "Please connect to the internet and retry."
                            );
                        else if (err.response.data === fileSizeError)
                            setErrorMsg(
                                "File is too large. Please choose a file of size < 100 MB."
                            );
                        else setErrorMsg(err.response.data);
                    }
                });
        } else {
            setErrorMsg("Please Select a File.");
        }
    };

    return (
        <section ref={homeRef} className="home">
            {/* display any error message if it's there */}
            <p className="error-msg">{errorMsg}</p>

            {/* the drag-and-drop section */}
            <form className="file-form" onSubmit={handleSubmit}>
                <section className="file-upload">
                    <Dropzone
                        onDrop={handleFile}
                        className="drop-file"
                        // update the style of the section on file selection
                        onDragEnter={() => updateBorder("over")}
                        onDragLeave={() => updateBorder("leave")}>
                        {({ getRootProps, getInputProps }) => (
                            <div
                                {...getRootProps({ className: "drop-zone" })}
                                ref={dropRef}>
                                <input {...getInputProps()} />
                                <p>
                                    Drag and Drop a File <br />
                                    or <br />
                                    Click Here to Select a File
                                </p>

                                {/* display the name of the selected file */}
                                {file.name ? (
                                    <div className="file-name">
                                        <strong style={{ fontWeight: "700" }}>
                                            Selected file:
                                        </strong>{" "}
                                        {file.name}
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        )}
                    </Dropzone>

                    {/* display any preview image or a message to say image preview isn't available */}
                    <div className="image-preview-message">
                        {previewSrc ? (
                            isPreviewAvailable ? (
                                <div className="image-preview">
                                    <img
                                        ref={previewImgRef}
                                        className="preview-image"
                                        src={previewSrc}
                                        alt="Preview"
                                    />
                                </div>
                            ) : (
                                <div className="preview-message">
                                    <p>No preview available for this file</p>
                                </div>
                            )
                        ) : (
                            <div className="preview-message">
                                <p>
                                    Image preview will be shown here after
                                    selection
                                </p>
                            </div>
                        )}
                    </div>

                    {/* display the progress bar */}
                    {progress > 0 ? (
                        <div className="progress">
                            <div
                                className="determinate"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    ) : (
                        ""
                    )}
                </section>

                {/* display the submit button after file selection */}
                {file.name && !displayLinks ? (
                    <button
                        ref={submitBtn}
                        className="submit-btn"
                        type="submit">
                        <span></span>
                        Submit
                        <img className="submit-icon" src={logo} alt="logo" />
                        <span></span>
                    </button>
                ) : (
                    ""
                )}
            </form>

            {/* display the links to download the file/ copy link for sharing the file, after successful file upload */}
            {displayLinks ? (
                <div className="final-links" ref={finalLinkRef}>
                    {/* onclicking the download button, use the dowbloadjs function to trigger the file download */}
                    <button
                        className="link"
                        onClick={() =>
                            download(
                                Uint8Array.from(uploadedFile.data.Body.data) // converting the buffer array to a uint8array, to be compliant with the downloadjs function requirement
                                    .buffer,
                                uploadedFile.file.file_name,
                                uploadedFile.file.file_mimetype
                            )
                        }>
                        Download File
                        <i className="material-icons">file_download</i>
                    </button>

                    {/* copy link to clipboard once this link is clicked */}
                    <button
                        className="share-link link"
                        onClick={handleBtnClick}
                        ref={shareBtnRef}
                        aria-label="Click to copy link">
                        <span></span> Share File
                        <i className="material-icons">share</i>
                        <span className="tooltiptext">Link Copied!</span>
                    </button>
                </div>
            ) : (
                ""
            )}
        </section>
    );
};

export default Home;
