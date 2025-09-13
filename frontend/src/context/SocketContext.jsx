import { createContext } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const socket = io("http://localhost:5000");

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Add prop validation
SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
