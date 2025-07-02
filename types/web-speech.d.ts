// Minimal additions to Web Speech API typings for browsers that are missing them.
// This complements @types/dom-speech-recognition so that the project compiles
// even when the environment's lib.dom.d.ts is out-of-date.

interface SpeechRecognitionErrorEvent extends Event {
  error: SpeechRecognitionErrorCode;
  message: string;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

// Extend the Window interface with the WebKit-prefixed version used on Safari.
interface Window {
  webkitSpeechRecognition: typeof SpeechRecognition;
  webkitSpeechGrammarList: typeof SpeechGrammarList;
  webkitSpeechRecognitionEvent: typeof SpeechRecognitionEvent;
}