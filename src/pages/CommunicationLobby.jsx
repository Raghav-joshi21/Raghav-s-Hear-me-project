import React, { useState, useCallback } from "react";
import { CopyIcon } from "../components/Icons";
import "./CommunicationLobby.css";

const CommunicationLobby = () => {
  const [roomId, setRoomId] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [participantType, setParticipantType] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Generate random room ID
  const generateRoomId = useCallback(() => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRoomId(newRoomId);
    setError("");
  }, []);

  // Create room on backend
  const handleCreateRoom = useCallback(async () => {
    if (!roomId.trim()) {
      setError("Please generate a room ID first");
      return;
    }

    try {
      setIsCreating(true);
      setError("");

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomId.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to create room");
      }

      const data = await response.json();
      const azureId = data.azureRoomId || data.groupCallId;

      if (!azureId) {
        throw new Error("No Azure room ID returned from server");
      }

      setCreatedRoomId(roomId.trim());
      console.log("✅ Room created:", roomId.trim());
    } catch (err) {
      console.error("❌ Error creating room:", err);
      setError(err.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  }, [roomId]);

  // Copy room code to clipboard
  const handleCopyRoomCode = useCallback(() => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId).then(() => {
        alert("Room code copied to clipboard!");
      }).catch(() => {
        alert("Failed to copy room code");
      });
    }
  }, [createdRoomId]);

  // Join room
  const handleJoinRoom = useCallback(() => {
    if (!roomId.trim()) {
      setError("Please enter or generate a room ID");
      return;
    }

    if (!participantType) {
      setError("Please select participant type");
      return;
    }

    if (!participantName.trim()) {
      setError("Please enter your name");
      return;
    }

    // Navigate to call page with room ID, participant type, and name
    const encodedName = encodeURIComponent(participantName.trim());
    window.location.href = `/communication/call/${roomId.trim()}?type=${participantType}&name=${encodedName}`;
  }, [roomId, participantType, participantName]);

  return (
    <div className="communication-lobby">
      <div className="lobby-container">
        <div className="lobby-header">
          <h1>Video calls and meetings for everyone</h1>
          <p>Connect, collaborate, and celebrate from anywhere</p>
        </div>

        <div className="lobby-actions">
          <div className="action-section">
            <h2>New meeting</h2>
            <div className="room-creation">
              <button
                className="btn-generate"
                onClick={generateRoomId}
                disabled={isCreating}
              >
                Generate Room Code
              </button>
              {roomId && (
                <div className="room-code-display">
                  <span className="room-code">{roomId}</span>
                  <button
                    className="btn-copy"
                    onClick={handleCopyRoomCode}
                    title="Copy room code"
                  >
                    <CopyIcon size={18} />
                  </button>
                </div>
              )}
              <button
                className="btn-create-room"
                onClick={handleCreateRoom}
                disabled={isCreating || !roomId}
              >
                {isCreating ? "Creating..." : "Create Room"}
              </button>
              {createdRoomId && (
                <div className="room-created-success">
                  ✅ Room "{createdRoomId}" created successfully!
                  <button
                    className="btn-copy-room"
                    onClick={handleCopyRoomCode}
                  >
                    Copy Room Code
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="action-section">
            <h2>Join meeting</h2>
            <div className="join-section">
              <input
                type="text"
                className="room-code-input"
                placeholder="Enter a code or link"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.toUpperCase());
                  setError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleJoinRoom();
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="participant-name-section">
          <h3>Enter your name</h3>
          <input
            type="text"
            className="name-input"
            placeholder="Your name (e.g., John Doe)"
            value={participantName}
            onChange={(e) => {
              setParticipantName(e.target.value);
              setError("");
            }}
            maxLength={50}
          />
        </div>

        <div className="participant-type-selection">
          <h3>Select participant type</h3>
          <div className="type-options">
            <button
              className={`type-option ${participantType === "deaf" ? "selected" : ""}`}
              onClick={() => setParticipantType("deaf")}
            >
              <span className="type-icon">👂</span>
              <span className="type-label">Enable features for Deaf participant</span>
            </button>
            <button
              className={`type-option ${participantType === "hearing" ? "selected" : ""}`}
              onClick={() => setParticipantType("hearing")}
            >
              <span className="type-icon">👤</span>
              <span className="type-label">Enable features for Hearing participant</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="join-button-container">
          <button
            className="btn-join"
            onClick={handleJoinRoom}
            disabled={!roomId.trim() || !participantType || !participantName.trim()}
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationLobby;

