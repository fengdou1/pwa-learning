const webpush = require('web-push');

// VAPID keys should be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();
 
console.log(vapidKeys.publicKey)
console.log(3333333)
console.log(vapidKeys.privateKey)

//BNzbmU415CQnqE7LKI1NpciuSTY3QVWO1dXteCQCU3qoBI0e9gwFKYXj4mCAJlaYnyylOERy8UbCAYmwjrlJDkA
 
//4TvDm8yA8vxN9WCKs01fLvVGY6OOIKnvLuMQMyW3sm8
urlsdd("BPY6LvFztv4Uz9k5REt1LGfT75JP_ulFiDU-LuMSNBnlDySg9qb2bVjwp75Y8Z794798ue5XyxCsXEHWK-zJA48")
 function urlsdd (base64String) {
     const padding = '='.repeat((4 - base64String.length % 4) % 4);
     console.log(padding);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  console.log(base64);
     const rawData = window.atob(base64);
     console.log(rawData);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
     }
     console.log(outputArray);
    return outputArray;
}