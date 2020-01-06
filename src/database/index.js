import Vasern from 'vasern';
import Messages from './Messages';

export default VasernDB = new Vasern({
  schemas: [Messages], version:1
})