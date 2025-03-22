// Score submission bridge
window.submitGameScore = async function(score, characterName = "Player") {
    try {
        console.log('Attempting to submit score:', score, 'for character:', characterName);
        
        // Send message to parent window
        window.parent.postMessage({
            type: 'SUBMIT_SCORE',
            score: score,
            characterName: characterName
        }, '*');

        // Wait for response
        return new Promise((resolve, reject) => {
            const handleResponse = (event) => {
                if (event.origin !== window.parent.location.origin) return;
                
                if (event.data.type === 'SCORE_SUBMITTED') {
                    window.removeEventListener('message', handleResponse);
                    resolve(true);
                } else if (event.data.type === 'SCORE_ERROR') {
                    window.removeEventListener('message', handleResponse);
                    reject(new Error(event.data.error));
                }
            };

            window.addEventListener('message', handleResponse);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                window.removeEventListener('message', handleResponse);
                reject(new Error('Score submission timed out'));
            }, 10000);
        });
    } catch (error) {
        console.error('Error submitting score:', error);
        alert("Failed to submit score. Please make sure your wallet is connected and try again.");
        throw error;
    }
}; 