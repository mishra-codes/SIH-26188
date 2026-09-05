import { useState, useRef, useCallback } from 'react';
import { verifyPassport } from '../api/verification';

export const STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',  // file chosen, previewing
  LOADING: 'loading',       // API call in flight
  RESULT: 'result',         // got a result
  ERROR: 'error',
};

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Verification service is unreachable. Check your connection or retry.',
  SERVER_ERROR:  'Verification service encountered an internal error. Please retry.',
  INVALID_FILE:  'The file was rejected. Upload a valid passport image (JPEG or PNG).',
  MALFORMED_RESPONSE: 'Received an unrecognised response from the server.',
  MISSING_FIELDS: 'Incomplete data returned. Please retry or perform manual inspection.',
  API_ERROR:     'Verification request failed. Please retry.',
  DEFAULT:       'An unexpected error occurred. Please retry or perform manual inspection.',
};

export function useVerification() {
  const [state, setState] = useState(STATES.IDLE);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const selectFile = useCallback((selectedFile) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
    setState(STATES.UPLOADING);
  }, [previewUrl]);

  const startVerification = useCallback(async () => {
    if (!file) return;
    abortRef.current = new AbortController();
    setState(STATES.LOADING);
    setError(null);
    try {
      const data = await verifyPassport(file, abortRef.current.signal);
      setResult(data);
      setState(STATES.RESULT);
    } catch (err) {
      if (err.name === 'AbortError') {
        setState(STATES.UPLOADING);
        return;
      }
      const msg = ERROR_MESSAGES[err.message] || ERROR_MESSAGES.DEFAULT;
      setError(msg);
      setState(STATES.ERROR);
    }
  }, [file]);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setState(STATES.IDLE);
  }, [previewUrl]);

  const cancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { state, file, previewUrl, result, error, selectFile, startVerification, reset, cancel };
}
