package com.project.Band_Up.dtos.webrtc;

import lombok.Data;
import java.util.UUID;

@Data
public class SignalingMessage {
    private String type;    // offer, answer, ice
    private UUID senderId;
    private UUID targetId;  // người nhận
    private UUID roomId;

    private Object sdp;     // SDP object
    private Object candidate; // ICE candidate
}
