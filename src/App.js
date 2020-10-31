import React, { Component } from 'react';
import './App.css';
import $ from 'jquery';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      company: {
        name: '',
        price: 0,
        amount: 1
      },
      list: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCompanyName = this.handleCompanyName.bind(this);
    this.handleAmount = this.handleAmount.bind(this);
    this.handlePrice = this.handlePrice.bind(this);
    this.handleName = this.handleName.bind(this);
    this.handleEmail = this.handleEmail.bind(this);
    this.handleInterests = this.handleInterests.bind(this);
    this.handleAddress = this.handleAddress.bind(this);
    this.handleNomatch = this.handleNomatch.bind(this);
  }

  handleCompanyName(e) {
    let value = e.target.value;
    this.setState( prevState => ({ company :
      {...prevState.company, name: value
      }
    }), () => console.log(this.state.company))
  }

  handlePrice(e) {
    let value = e.target.value;
    this.setState( prevState => ({ company :
      {...prevState.company, price: value
      }
    }), () => console.log(this.state.company))
  }

  handleAmount(e) {
    let value = e.target.value;
    if (value < this.state.list.length) {
      this.state.list.length = value;
    } else if (value > this.state.list.length) {
      let increaseBy = value - this.state.list.length;
      for (let i=0; i<increaseBy; i++) {
        this.state.list.push({name: '', email: ''})
      }
    }

    this.setState( prevState => ({ company :
      {...prevState.company, amount: value
      }
    }), () => console.log(this.state))
  }

  handleName(index, e) {
    let value = e.target.value;
    this.state.list[index].name = value;
  }

  handleEmail(index, e) {
    let value = e.target.value;
    this.state.list[index].email = value;
  }

  handleInterests(index, e) {
    let value = e.target.value;
    this.state.list[index].interests = value;
  }

  handleAddress(index, e) {
    let value = e.target.value;
    this.state.list[index].address = value;
  }

  handleNomatch(index, e) {
    let value = e.target.value;
    this.state.list[index].nomatch = value;
  }

  handleSubmit(event) {
    event.preventDefault();
    let newPairs = this.randomizeSantas();
    // Check to make sure no nomatches were made
    let needToRepick = this.checkNoMatches(newPairs);

    while (needToRepick) {
      newPairs = this.randomizeSantas();
      needToRepick = this.checkNoMatches(newPairs);
    }
    console.log('ALL GOOD:',newPairs);
    // this.sendEmails(newPairs);
  }

  checkNoMatches(pairs) {
    let needToRepick = false;
    for (let giver of pairs) {
      if (giver.santa.nomatch === giver.givesTo.name) {
        console.log('NO MATCH')
        needToRepick = true;
      }
    }
    return needToRepick;
  }

  // Assign each member in this.state.list to another member
  //  - No duplicates, 1:1 assignment
  //  - Members cannot be assigned to themselves
  randomizeSantas() {
    let santaList = [];
    let hasntReceived = [].concat(this.state.list);
    console.log('0:',hasntReceived)

    for (let giver of this.state.list) {
      /* Prepare the arrays and data we need */
      // 'giver' is the current person buying
      // Duplicate hasntReceived and remove the giver
      let hasntReceivedNoGiver = [].concat(hasntReceived);
      let indexOfGiver = hasntReceivedNoGiver.findIndex((r) => {
        return r === giver;
      });
      if (indexOfGiver > -1) {
        hasntReceivedNoGiver.splice(indexOfGiver, 1);
      }

      /* Try to figure out the receiver */
      let i;
      let receiver;
      // If there is no one left in the hasntReceived, then we need to do a swap
      if (hasntReceivedNoGiver.length === 0) {
        receiver = giver;
      } else {
        // Select a random index from 0 -> list.length
        i = Math.floor(Math.random() * (hasntReceivedNoGiver.length-1));
        // This index is the user they are assigned to
        receiver = hasntReceivedNoGiver[i];
      }

      /* Make sure they aren't assigned to themself */
      while (receiver === giver) {
        // In the case that the last person to receive is the giver,
        //  swap one of the already created pairs with this last one
        if (hasntReceivedNoGiver.length === 0) {
          // Randomly select a new receiver
          i = Math.floor(Math.random() * (this.state.list.length-1));
          receiver = this.state.list[i];
          // Find the pair in santaList where the receiver is
          let oldIndex = santaList.findIndex((pair) => {
            return pair.givesTo === receiver;
          })
          let oldPair = santaList[oldIndex];
          // Replace old pair's receiver with duped receiver
          let oldReceiver = oldPair.givesTo;
          oldPair.givesTo = giver;
          santaList[oldIndex] = oldPair;
        } else {
          // Otherwise, repick the pair
          i = Math.floor(Math.random() * (hasntReceivedNoGiver.length-1));
          receiver = hasntReceivedNoGiver[i];
        }
      }

      /* Finish up */
      // Save and remove the receiver from list
      let remove = hasntReceived.indexOf(receiver);
      hasntReceived.splice(remove, 1);

      // Add giver and receiver to list
      santaList.push({santa: giver, givesTo: receiver})
    }
    return santaList;
  }

  sendEmails(list) {
    for (let pair of list) {
      var data = {
        service_id: 'sendgrid',
        template_id: 'secret_santa',
        user_id: 'user_jB6xtfaUg7xLd5DVzECFZ',
        template_params: {
          'company': this.state.company.name,
          'giver_name': pair.santa.name,
          'receiver_name': pair.givesTo.name,
          'price': this.state.company.price,
          'interests': pair.givesTo.interests,
          'address': pair.givesTo.address,
          'giver_email': pair.santa.email
        }
      };

      $.ajax('https://api.emailjs.com/api/v1.0/email/send', {
          type: 'POST',
          data: JSON.stringify(data),
          contentType: 'application/json'
      }).done(function() {
          console.log('Your mail is sent!');
      }).fail(function(error) {
          console.log('Oops... ' + JSON.stringify(error));
      });
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Keep it <i>Secret</i>, Keep it <i>Santa</i></h1>
        </header>
        <div className="form-entry">
          <p>Just enter your players' name, email, and a few hints and we'll take care of the rest!
            We'll send each Secret Santa's target directly to their email, so even the organizer doesn't know who has who.</p>
          <form onSubmit={this.handleSubmit}>
            <h2>Company or Group Name</h2>
            <div>
              <div className="full">
                <label>Company or Group Name</label>
                <input className="full-input" type="text" value={this.state.company.name} onChange={this.handleCompanyName}/>
              </div>
              <br/>
              <div className="half">
                <div className="half-div">
                  <label>Price Limit</label>
                  <input className="half-input" type="number" ref={this.state.company.price} onChange={this.handlePrice}/>
                </div>
                <br/>
                <div className="half-div">
                  <label>Amount of Participants</label>
                  <input className="half-input" type="number" ref={this.state.company.amount} onChange={this.handleAmount}/>
                </div>
              </div>
            </div>

            { this.state.list.length > 0 &&
            <div>
              <h2>Secret Santas List</h2>
              <div>
                {this.state.list.map((d, index) => {
                   return (
                     <div className="santa">
                       <div className="half">
                        <div className="half-div">
                         <label>Name</label>
                         <input className="half-input" type="text" ref={this.state.list[index].name} onChange={this.handleName.bind(this, index)}/>
                        </div>
                        <div className="half-div">
                         <label>Email</label>
                         <input className="half-input" type="email" ref={this.state.list[index].email} onChange={this.handleEmail.bind(this, index)}/>
                        </div>
                      </div>
                      <div className="half">
                       <div className="half-div">
                        <label>Physical Address</label>
                        <input className="half-input" type="text" ref={this.state.list[index].address} onChange={this.handleAddress.bind(this, index)}/>
                       </div>
                       <div className="half-div">
                        <label>Don't match with</label>
                        <input className="half-input" type="text" ref={this.state.list[index].nomatch} onChange={this.handleNomatch.bind(this, index)}/>
                       </div>
                      </div>
                      <div className="full">
                       <label>A few interests</label>
                       <input className="full-input" type="text" ref={this.state.list[index].interests} onChange={this.handleInterests.bind(this, index)}/>
                      </div>
                      <br/>
                     </div>
                   )
                 })}
              </div>
              <input className="submit" type="submit" value="Submit" />
            </div>
          }
          </form>
        </div>
        <div className="App-footer">
          Made with ♡ by <a className="App-link" href="https://github.com/brookse">Lyzzi Brooks</a>
        </div>
      </div>
    );
  }
}

export default App;
