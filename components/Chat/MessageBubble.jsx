"use client"

export default function MessageBubble({ message, isOwn, showAvatar }) {
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }

    return (
        <div className={`message-bubble mb-3 d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`d-flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} align-items-end`} style={{ maxWidth: '70%' }}>
                {/* Avatar */}
                {showAvatar && !isOwn && (
                    <img
                        src={message.sender?.profilePicture || '/default-avatar.png'}
                        alt={message.sender?.username || 'User'}
                        className="rounded-circle me-2"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                )}
                
                {/* Message Content */}
                <div className={`message-content ${isOwn ? 'ms-2' : 'me-2'}`}>
                    <div
                        className={`p-2 rounded-3 ${
                            isOwn 
                                ? 'bg-primary text-white' 
                                : 'bg-white border'
                        }`}
                        style={{
                            wordBreak: 'break-word',
                            ...(isOwn ? {
                                borderBottomRightRadius: '0.375rem'
                            } : {
                                borderBottomLeftRadius: '0.375rem'
                            })
                        }}
                    >
                        {/* Sender name (only for received messages) */}
                        {!isOwn && showAvatar && (
                            <div className="fw-bold text-primary" style={{ fontSize: '0.8rem' }}>
                                {message.sender?.username || 'Unknown User'}
                            </div>
                        )}
                        
                        {/* Message text */}
                        <div style={{ fontSize: '0.9rem' }}>
                            {message.content}
                        </div>
                        
                        {/* Timestamp */}
                        <div 
                            className={`text-end mt-1 ${isOwn ? 'text-white-50' : 'text-muted'}`}
                            style={{ fontSize: '0.7rem' }}
                        >
                            {formatTime(message.createdAt)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}