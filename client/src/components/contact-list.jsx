import { useAppStore } from "@/store";
import React, { useEffect } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
    selectedChatMessages,
    onlineUsers,
    notification,
    setNotification,
  } = useAppStore();

  const handleClick = (contact) => {
    setSelectedChatType(isChannel ? "channel" : "contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  useEffect(() => {
    if (contacts.length > 0) {
      const notifications = contacts.flatMap((contact) => {
        if (contact.messages && contact.lastMessageType === "text") {
          return contact.messages.filter((item) => !item.seen);
        }
        return [];
      });

      const sortedNotifications = notifications.map((item) => ({
        type: item.messageType,
        sender: item.sender,
        recipient: item.recipient,
        content: item.content,
      }));

      setNotification(sortedNotifications);
    }
  }, [
    selectedChatMessages,
    setSelectedChatMessages,
    selectedChatData,
    setNotification,
  ]);

  const renderLastMessage = (contact) => {
    if (contact.lastMessageType === "text") {
      return contact.lastMessageContent;
    }

    return <span>Send file</span>;
  };

  const getNotificationCount = (contact) => {
    return notification.filter((notif) => notif.sender === contact._id).length;
  };

  console.log(notification);

  return (
    <div className="mt-5">
      {contacts.map((contact) => {
        const isSelected =
          selectedChatData && selectedChatData._id === contact._id;
        const isOnline = onlineUsers.includes(contact._id.toString());

        const hasNotification = getNotificationCount(contact) > 0;

        return (
          <div
            onClick={() => handleClick(contact)}
            key={contact._id}
            className={`pl-10 py-2 transition-all duration-300 cursor-pointer relative ${
              isSelected
                ? "bg-[#8417ff] hover:bg-[#8417ff]/50 group/user"
                : "hover:bg-[#f1f1f111]"
            }`}
          >
            {hasNotification && (
              <div
                className={`absolute ${
                  selectedChatData && "hidden md:block"
                } w-5 h-5 rounded-full z-50 right-3 top-6 bg-blue-500 transition-all flex items-center justify-center`}
              >
                <span className="text-xs block text-white text-center"></span>
              </div>
            )}
            <div className="flex gap-5 items-center relative justify-start text-neutral-500">
              {!isChannel && (
                <div className="relative">
                  {isOnline && (
                    <div
                      className={`absolute ${
                        selectedChatData && selectedChatData._id === contact._id
                          ? "hidden md:block border-[#8417ff]"
                          : "border-[#1b1c24]"
                      } w-3 h-3 rounded-full z-10 -bottom-0 -right-0 border-2 bg-[#06d6ae] transition-all`}
                    />
                  )}
                  <Avatar className="w-12 h-12 rounded-full overflow-hidden">
                    {contact.image ? (
                      <AvatarImage
                        src={`${HOST}/${contact.image}`}
                        alt="profile"
                        className="object-cover w-full h-full bg-black"
                      />
                    ) : (
                      <div
                        className={`${
                          isSelected
                            ? "bg-[#ffffff22] border-2 border-white/70"
                            : getColor(contact.color)
                        } uppercase w-12 h-12 text-lg border-[1px] flex items-center justify-center rounded-full`}
                      >
                        {contact.firstName
                          ? contact.firstName[0]
                          : contact.email[0]}
                      </div>
                    )}
                  </Avatar>
                </div>
              )}
              {isChannel && (
                <div className="bg-[#ffffff22] h-10 w-10 rounded-full flex items-center justify-center">
                  #
                </div>
              )}

              <div className="w-44 h-auto line-clamp-1 flex flex-col">
                <span className="font-bold">
                  {isChannel
                    ? contact.name
                    : contact.firstName
                    ? `${contact.firstName} ${contact.lastName}`
                    : contact.email}
                </span>
                <span>{renderLastMessage(contact)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
