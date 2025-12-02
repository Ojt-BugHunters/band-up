package com.project.Band_Up.dtos.webrtc;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.UUID;

@Data
public class SignalingMessage {
    private String type;    // join, ready, offer, answer, ice-candidate, leave

    private String senderId;  // ĐỔI THÀNH String thay vì UUID
    private String roomId;     // ĐỔI THÀNH String thay vì UUID

    private Object sdp;        // SDP object (cho offer/answer)
    private Object candidate;  // ICE candidate object

    // Support cả 2 format: "ice-candidate" và "ice" (backward compatible)
    @JsonProperty("ice-candidate")
    public void setIceCandidate(Object candidate) {
        this.candidate = candidate;
    }
}