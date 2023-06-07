import { LightningElement } from 'lwc';

export default class EinsteinGPTChat extends LightningElement {
    // ****** Props ******

  // State
  pannelState = "empty"; // empty | active
  loading = true;

  // Config
  config;
  user;

  // Data
  responses;

  

}