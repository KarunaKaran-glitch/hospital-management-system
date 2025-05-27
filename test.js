const person = {
  name: "karan",
  age: 50,
  isEligible: false,
};

let newPerson = '{"name":"karan","age":50,"isEligible":false}';
newPerson = JSON.parse(newPerson);

console.log(person.name);
console.log(newPerson.name);
