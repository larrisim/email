document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;
  //document.getElementById('#email-list');
  
 

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-list').style.display = 'none';
  document.querySelector('#read-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}


function send_email(event) {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result 
        //console.log(result)
        //console.log(result.status)

        if (result["error"]) {

          alert("invalid Email send!");
        
        }else{
          load_mailbox('inbox'); 
        };
             
  });
  
  event.preventDefault();
  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-list').style.display = 'block';
  document.querySelector('#read-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#email-list').innerHTML ="";
  //console.log(`This is${mailbox}`);
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    for (let i = 0; i < emails.length; i++){
   
      //document.getElementById('#container').innerHTML = emails[i].subject;
      const element = document.createElement('div');
      
      //element.innerHTML = emails[i].subject;
      if (mailbox === "sent"){
      element.innerHTML= `
      <b>${emails[i].recipients}</b>` + '&nbsp&nbsp' + `${emails[i].subject}` + '<span style="float:right;">' + `${emails[i].timestamp}</span>`;
      }else{
        element.innerHTML= `<b>${emails[i].sender}</b>` + '&nbsp&nbsp' + `${emails[i].subject}` + '<span style="float:right;">' + `${emails[i].timestamp}</span>`;
      }

      element.style.border = "1px solid";
      element.style.padding = "10px";

      if (emails[i].read === true){
        element.style.backgroundColor = "lightgray";
      } else{
        element.style.backgroundColor = "white";
      }

      element.addEventListener('click', function() {

        load_email(emails[i], mailbox);
      })
      document.querySelector('#email-list').append(element)

    } 
  
    // ... do something else with emails ...

  });
}

function load_email(email, mailbox){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-list').style.display = 'none';
  document.querySelector('#read-email').style.display = 'block';

  if (mailbox ==="sent"){
    document.querySelector('#archive').style.display = 'none';
  }else{
    document.querySelector('#archive').style.display = 'inline-block';
  }

  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {

    document.querySelector('#sender').innerHTML= `<b>From: </b>${email.sender}`;
    document.querySelector('#receiver').innerHTML = `<b>To: </b>${email.recipients}`;
    document.querySelector('#subject').innerHTML = `<b>Subject: </b>${email.subject}`;
    document.querySelector('#timestamp').innerHTML = `<b>Timestamp: </b>${email.timestamp}`;
    document.querySelector('#content').innerHTML = `${email.body}`;

    document.querySelector('#reply-button').addEventListener('click', function(){
      
      reply_email(email);
      
    });

    

    if (email.archived === true){
      document.querySelector('#archive').innerHTML = "Unarchive";
    } else{
      document.querySelector('#archive').innerHTML = "Archive";
    }
    
    //archive email
    document.querySelector('#archive').addEventListener('click', function(){

      archive(email);
      document.location.reload();
    
    });
  
    //reply email

    
});

fetch(`/emails/${email.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
  })
})

}

function archive(email){
  
  console.log(email.archived)
  if(email.archived ===true){
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  }else{
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })

  }
}

function reply_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-list').style.display = 'none';
  document.querySelector('#read-email').style.display = 'none';


  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${email.sender}`;
    
  if (email.subject.length >=3 & email.subject[0]+email.subject[1]+email.subject[2] ==="RE:"){
    document.querySelector('#compose-subject').value = `${email.subject}`;
  } else{
  document.querySelector('#compose-subject').value = `RE: ${email.subject}`;
  }

  document.querySelector('#compose-body').value = `On ${email.timestamp}  ${email.sender} wrote: ${email.body}`;

  })
}