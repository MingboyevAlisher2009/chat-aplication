import TelegramAudioPlayer from "@/components/audio.palyer";
import VideoPlayer from "@/components/player";
import apiClient from "@/lib/api.client";
import { useAppStore } from "@/store";
import {
  GET_MESSAGES_CHANNEL_ROUTE,
  GET_MESSAGES_ROUTE,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { MdDelete, MdEdit, MdFolder, MdOutlineSaveAlt } from "react-icons/md";
import { IoMdArrowRoundDown, IoMdCheckmark } from "react-icons/io";
import { IoCheckmarkDone, IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TiArrowBack, TiArrowBackOutline } from "react-icons/ti";
import { FiCopy } from "react-icons/fi";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socket-context";

const MessageContainer = () => {
  const scrollRef = useRef(null);
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    setFileDownloadProgress,
    setIsDownloading,
    setAnswer,
    setNotification,
    notification,
    setEditMessage,
  } = useAppStore();
  const socket = useSocket();

  const [showImage, setshowImage] = useState(false);
  const [imageUrl, setimageUrl] = useState(null);
  const currentlyPlayingMediaRef = useRef(null);
  const [deleteModal, setdeleteModal] = useState(false);
  const [messageId, setMessageId] = useState(null);

  const toggleDeleteModal = () => setdeleteModal(!deleteModal);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-id");
            const message = selectedChatMessages.find(
              (msg) => msg._id === messageId
            );

            if (message && !message.seen && message.sender !== userInfo._id) {
              socket.emit("update-message", {
                ...message,
                seen: true,
              });

              const updatedNotification = notification.filter(
                (state) => state.sender !== message.sender
                // state.recipient !== message.recipient
              );
              setNotification(updatedNotification);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const messageElements = document.querySelectorAll(".message");
    messageElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      messageElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [
    selectedChatMessages,
    selectedChatData,
    notification,
    userInfo,
    socket,
    setNotification,
  ]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(GET_MESSAGES_ROUTE, {
          id: selectedChatData._id,
        });
        if (response.status === 200) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const data = await apiClient.get(
          `${GET_MESSAGES_CHANNEL_ROUTE}/${selectedChatData._id}`
        );
        if (data.status === 200) {
          setSelectedChatMessages(data.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMessages();
      } else if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  const checkImage = (filePath) => {
    const imageRegex = /\.(jpg|png|jpeg|gif|tiff|bmp|webp|ico|heif)$/i;
    return imageRegex.test(filePath);
  };

  const handleDelete = async () => {
    try {
      if (!messageId) throw new Error();
      socket.emit("delete-message", { id: messageId });
      notification.filter((notif) => notif._id !== messageId);
      toggleDeleteModal();
    } catch (error) {
      console.log(error);
    }
  };

  const downloadFile = async (url) => {
    if (typeof setIsDownloading !== "function") {
      console.error("setIsDownloading is not a function");
      return;
    }

    setIsDownloading(true);
    setFileDownloadProgress(0);
    try {
      const { data } = await apiClient.get(`${HOST}/${url}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          setFileDownloadProgress(percentCompleted);
        },
      });
      const urlBlob = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", url.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
      setIsDownloading(false);
      setFileDownloadProgress(0);
    } catch (error) {
      console.error("Error downloading the file:", error);
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const renderMessage = () => {
    let lastDate = null;
    return selectedChatMessages.map((message) => {
      const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={message._id} data-id={message._id} className="message">
          {showDate && (
            <div className="text-center w-44 mx-auto relative mb-10 shadow-lg my-2 rounded bg-transparent py-2 text-white">
              {moment(message.createdAt).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDmMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const handleScroll = (messageId) => {
    const element = document.getElementById(messageId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            element.style.background = "#8317ff45";
            element.style.transition = "all 300ms ease-in-out";

            setTimeout(() => {
              element.style.background = "transparent";
            }, 1000);

            observer.disconnect();
          }
        },
        {
          threshold: 1.0,
        }
      );

      observer.observe(element);
    }
  };

  const renderDmMessages = (message) => (
    <ContextMenu>
      <div
        id={message._id}
        data-id={message._id}
        className={`flex px-5 rounded ${
          message.sender !== selectedChatData._id
            ? "justify-start "
            : "justify-end"
        }`}
      >
        <div className="flex flex-col my-2 text-[#8317ff45]">
          {message.messageType === "text" && (
            <ContextMenuTrigger
              className={`${
                message.sender !== selectedChatData._id
                  ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50 relative"
                  : "bg-[#2a2b33]/5 text-white/80 border-white/50 relative"
              } border inline-block p-4 rounded my-1 max-w-auto break-words`}
            >
              {message.answer && (
                <button
                  onClick={() => handleScroll(message.answer._id)}
                  className="flex gap-2 items-center mb-2 text-white bg-gray-500/50 p-2 rounded cursor-pointer select-none"
                >
                  <TiArrowBack className="text-2xl" />
                  {message.answer.messageType === "text" ? (
                    <p>{message.answer.content}</p>
                  ) : (
                    <img
                      className="w-10 h-10 bg-center bg-cover"
                      src={`${HOST}/${message.answer.fileUrl}`}
                    />
                  )}
                </button>
              )}
              {message.content}
              {message.sender !== selectedChatData._id && (
                <span className="absolute bottom-1 right-1">
                  {message.seen ? <IoCheckmarkDone /> : <IoMdCheckmark />}
                </span>
              )}
            </ContextMenuTrigger>
          )}
          {message.messageType === "file" && (
            <ContextMenuTrigger
              className={`${
                message.sender !== selectedChatData._id
                  ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50 relative"
                  : "bg-[#2a2b33]/5 text-white/80 border-white/50 relative"
              } border inline-block p-4 rounded my-1 max-w-auto break-words`}
            >
              {message.sender !== selectedChatData._id && (
                <span className="absolute bottom-1 right-1 ">
                  {message.seen ? <IoCheckmarkDone /> : <IoMdCheckmark />}
                </span>
              )}
              {checkImage(message.fileUrl) ? (
                <div
                  onClick={() => {
                    setshowImage(true);
                    setimageUrl(message.fileUrl);
                  }}
                  className="cursor-pointer"
                >
                  <img
                    className="bg-cover bg-center object-cover rounded-lg"
                    width={300}
                    height={300}
                    src={`${HOST}/${message.fileUrl}`}
                    alt={message.sender}
                  />
                 
                </div>
              ) : message.fileUrl.toLowerCase().endsWith(".mp3") ||
                message.fileUrl.toLowerCase().endsWith(".m4a") ? (
                <TelegramAudioPlayer
                  message={message}
                  title={message.fileUrl.split("/").pop()}
                  downloadFile={downloadFile}
                  onPlay={(videoRef) => handlePlayMedia(videoRef)}
                />
              ) : message.fileUrl.toLowerCase().endsWith(".mp4") ? (
                <VideoPlayer
                  message={message}
                  downloadFile={downloadFile}
                  onPlay={(videoRef) => handlePlayMedia(videoRef)} // Ensure only one video plays at a time
                />
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <span>
                    <MdFolder size={30} />
                  </span>
                  <span>{message.fileUrl.split("/").pop()}</span>
                  <span
                    className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                    onClick={() => downloadFile(message.fileUrl)}
                  >
                    <IoMdArrowRoundDown />
                  </span>
                </div>
              )}
            </ContextMenuTrigger>
          )}
          <div className="text-xs text-right text-gray-600">
            {moment(message.createdAt).format("LT")}
          </div>
        </div>
      </div>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => setAnswer(message)}
          className="gap-3 text-lg"
        >
          <TiArrowBackOutline size={25} />
          Answer
        </ContextMenuItem>
        <ContextMenuItem className="gap-3 text-lg">
          {message.messageType === "file" ? (
            <button
              onClick={() => downloadFile(message.fileUrl)}
              className="flex gap-3"
            >
              <MdOutlineSaveAlt size={25} />
              Save
            </button>
          ) : (
            <button
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="flex gap-3"
            >
              <FiCopy size={22} />
              Copy
            </button>
          )}
        </ContextMenuItem>
        {message.sender !== selectedChatData._id &&
          message.messageType !== "file" && (
            <ContextMenuItem
              onClick={() => setEditMessage(message)}
              className="gap-3 text-lg"
            >
              <MdEdit size={25} />
              Edit
            </ContextMenuItem>
          )}
        <ContextMenuItem
          onClick={() => {
            toggleDeleteModal();
            setMessageId(message._id);
          }}
          className="gap-3 text-lg"
        >
          <MdDelete size={25} />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  const handlePlayMedia = (mediaRef) => {
    // Pause the currently playing media
    if (
      currentlyPlayingMediaRef.current &&
      currentlyPlayingMediaRef.current !== mediaRef
    ) {
      currentlyPlayingMediaRef.current.pause();
    }

    currentlyPlayingMediaRef.current = mediaRef;
  };

  const renderChannelMessages = (message) => {
    return (
      <div
        data-id={message._id}
        className={`mt-5 ${
          message.sender._id !== userInfo._id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id !== userInfo._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50 relative"
                : "bg-[#2a2b33]/5 text-white/80 border-white/50 relative"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-12`}
          >
            {message.answer && (
              <button
                onClick={() => handleScroll(message.answer._id)}
                className="flex gap-2 items-center mb-2 text-white bg-gray-500/50 p-2 rounded cursor-pointer select-none"
              >
                <TiArrowBack className="text-2xl" />
                <p>{message.answer.content}</p>
              </button>
            )}
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id === userInfo._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50 relative"
                : "bg-[#2a2b33]/5 text-white/80 border-white/50 relative"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkImage(message.fileUrl) ? (
              <div
                onClick={() => {
                  setshowImage(true);
                  setimageUrl(message.fileUrl);
                }}
                className="cursor-pointer"
              >
                <img
                  className="bg-cover bg-center object-cover"
                  width={300}
                  height={300}
                  src={`${HOST}/${message.fileUrl}`}
                  alt={message.sender}
                />
              </div>
            ) : message.fileUrl.toLowerCase().endsWith(".mp3") ||
              message.fileUrl.toLowerCase().endsWith(".m4a") ? (
              <TelegramAudioPlayer
                src={message.fileUrl}
                title={message.fileUrl.split("/").pop()}
                downloadFile={downloadFile}
                onPlay={(audioRef) => handlePlayMedia(audioRef)}
              />
            ) : message.fileUrl.toLowerCase().endsWith(".mp4") ? (
              <VideoPlayer
                initialSrc={message.fileUrl}
                title={message.fileUrl.split("/").pop()}
                downloadFile={downloadFile}
                onPlay={(audioRef) => handlePlayMedia(audioRef)}
              />
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span>
                  <MdFolder size={30} />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {message.sender._id !== userInfo._id ? (
          <div className="flex items-center justify-start gap-5">
            <Avatar className="w-12 h-12 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}
              <AvatarFallback
                className={`uppercase w-12 h-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName.split("").shift()
                  : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            <div className="text-sm text-white/60">
              {moment(message.createdAt).format("LT")}
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/60">
            {moment(message.createdAt).format("LT")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] 
      xl:w-[80vw] w-full"
    >
      {renderMessage()}

      {showImage && (
        <div className="fixed z-[10000] top-0 left-0 w-full h-[100vh] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img
              src={`${HOST}/${imageUrl}`}
              alt={imageUrl}
              className="h-[80vh] w-full bg-cover"
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageUrl)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setshowImage(false);
                setimageUrl(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
      <Dialog open={deleteModal} onOpenChange={toggleDeleteModal}>
        <DialogContent>
          <DialogDescription>
            <p className="text-xl my-3 text-white">
              Are you sure you want to delete this message?
            </p>
          </DialogDescription>
          <DialogFooter>
            <DialogClose>
              <Button>Close</Button>
            </DialogClose>
            <Button
              className="bg-red-500 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageContainer;
