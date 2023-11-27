import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const RoomPage = () => {
  const { roomId } = useParams();
  const containerRef = useRef(null);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const myMeeting = async () => {
      if (!roomId) {
        console.error("Room ID is empty");
        return;
      }

      const appID = 916711083;
      const serverSecret = "a29dc0ef20a78ba206369c658c82a492";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        Date.now().toString(),
        "Enter your name here"
      );
      const zc = ZegoUIKitPrebuilt.create(kitToken);
      zc.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
      });

      // Initialize speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechRecognition = new SpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      // Start capturing audio and transcribing it
      speechRecognition.start();
      speechRecognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Update the transcript UI
        setTranscript(finalTranscript);
      };

      // Cleanup function
      return () => {
        zc.leaveRoom();
        speechRecognition.stop();
      };
    };

    myMeeting();
  }, [roomId]);

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div>
        <div>{transcript}</div>
        <button onClick={handleDownload}>Download Transcript</button>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
    </div>
  );
};

export default RoomPage;





