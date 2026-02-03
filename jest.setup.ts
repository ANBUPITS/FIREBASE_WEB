import { TextEncoder, TextDecoder } from 'util';
import "@testing-library/jest-dom";
import 'whatwg-fetch';

Object.assign(global, {
  TextEncoder: TextEncoder,
  TextDecoder: TextDecoder,
});

// Mock fetch if whatwg-fetch doesn't provide it
if (!global.fetch) {
  global.fetch = jest.fn();
}