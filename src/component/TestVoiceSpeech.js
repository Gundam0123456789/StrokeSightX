import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import './LoginRegister.css'

export function VoiceTrigger() {
  useEffect(() => {
    const recognition = new window.webkitSpeechRecognition(); // Use SpeechRecognition if not on Chrome
    recognition.continuous = true;
    recognition.lang = 'TH';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log('Heard:', transcript);

      if (transcript.includes('เริ่มทำ')) {
        Swal.fire({
                title: 'detect',
                text: 'starting task',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass : {
                    title: 'swal-title',
                    text: 'swal-title',
                }
                    });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, []);

}
