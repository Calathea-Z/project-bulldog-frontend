// src/types/axios.ts
import { AxiosRequestConfig } from 'axios';

export interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}
