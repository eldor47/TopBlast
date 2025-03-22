// Score submission bridge
window.submitGameScore = async function(score, characterName = "Player") {
    try {
        console.log('Attempting to submit score:', score, 'for character:', characterName);
        
        // Validate score
        if (typeof score !== 'number' || isNaN(score)) {
            console.error('Invalid score:', score);
            throw new Error('Invalid score format');
        }

        // Send message to parent window
        window.parent.postMessage({
            type: 'SUBMIT_SCORE',
            score: score,
            characterName: characterName
        }, '*');

        // Wait for response
        return new Promise((resolve, reject) => {
            const handleResponse = (event) => {
                if (event.origin !== window.parent.location.origin) {
                    console.warn('Received message from unauthorized origin:', event.origin);
                    return;
                }
                
                if (event.data.type === 'SCORE_SUBMITTED') {
                    console.log('Score submitted successfully');
                    window.removeEventListener('message', handleResponse);
                    resolve(true);
                } else if (event.data.type === 'SCORE_ERROR') {
                    console.error('Score submission failed:', event.data.error);
                    window.removeEventListener('message', handleResponse);
                    reject(new Error(event.data.error));
                }
            };

            window.addEventListener('message', handleResponse);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                console.error('Score submission timed out');
                window.removeEventListener('message', handleResponse);
                reject(new Error('Score submission timed out'));
            }, 10000);
        });
    } catch (error) {
        console.error('Error submitting score:', error);
        // Log more details about the error
        if (error.message) console.error('Error message:', error.message);
        if (error.stack) console.error('Error stack:', error.stack);
        alert("Failed to submit score. Please make sure your wallet is connected and try again.");
        throw error;
    }
}; 