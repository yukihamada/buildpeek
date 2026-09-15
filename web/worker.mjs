import { scan } from './scanner.mjs';
self.onmessage = ({ data }) => {
  try { self.postMessage({ id: data.id, result: scan(data.input, data.mode) }); }
  catch (error) { self.postMessage({ id: data.id, error: error.message }); }
};
