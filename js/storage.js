export function initStorage() {
  if (!localStorage.getItem("dorm_users")) {
    localStorage.setItem("dorm_users", JSON.stringify([
      { id:1, role:"student", login:"student", password:"1", name:"Иван Петров", group:"ПО-41", room:"405", work:{autumn:3,winterSpring:2}},
      { id:2, role:"admin", login:"admin", password:"1", name:"Анна Комендант", position:"комендант"}
    ]));
  }

  if (!localStorage.getItem("dorm_bookings"))
    localStorage.setItem("dorm_bookings", JSON.stringify([]));

  if (!localStorage.getItem("dorm_tickets"))
    localStorage.setItem("dorm_tickets", JSON.stringify({
      electric:[], plumber:[], locksmith:[]
    }));

  if (!localStorage.getItem("dorm_news"))
    localStorage.setItem("dorm_news", JSON.stringify([]));

  if (!localStorage.getItem("dorm_acts"))
    localStorage.setItem("dorm_acts", JSON.stringify([]));

  if (!localStorage.getItem("dorm_next_id"))
    localStorage.setItem("dorm_next_id", "100");
}

export function getNextId(){
  let id = Number(localStorage.getItem("dorm_next_id"));
  id++;
  localStorage.setItem("dorm_next_id", id);
  return id;
}