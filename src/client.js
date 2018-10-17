import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import io from 'socket.io-client';
import initServices from './frontendServices';

const url = `${window.location.protocol}//${window.location.host}`;
const socket = io(url);

const client = feathers()
  .configure(socketio(socket, {
    timeout: 30000
  }))
  .configure(initServices());


client.set('url', url);
client.service.bind(client);

window.client = client;
// window.client = client; // TO BE REMOVED

export default client;
