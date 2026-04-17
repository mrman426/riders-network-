import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ✅ YOUR REAL KEYS
const supabaseUrl = "https://qxqtqiwcwnnkbpkhenyj.supabase.co";
const supabaseKey = "sb_publishable_P49Tk395y5TEhFbUdYa4KQ_VrfAh0gD";

const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;

// 🔐 SIGN UP
window.signup = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  console.log("SIGNUP:", data, error);
};

// 🔐 LOGIN
window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return alert(error.message);

  currentUser = data.user;
  console.log("LOGGED IN:", currentUser);

  loadRides();
};

// 🚴 CREATE RIDE
window.createRide = async () => {
  if (!currentUser) return alert("Login first");

  const location = document.getElementById("location").value;
  const level = document.getElementById("level").value;

  const { error } = await supabase.from("rides").insert({
    location,
    level,
    user: currentUser.email,
    joined: []
  });

  if (error) return alert(error.message);

  loadRides();
};

// 📥 LOAD RIDES
async function loadRides() {
  const { data, error } = await supabase.from("rides").select("*");

  if (error) return console.log(error);

  const div = document.getElementById("rides");
  div.innerHTML = "";

  data.forEach(r => {
    div.innerHTML += `
      <div class="box">
        📍 ${r.location}<br>
        ⚡ Level ${r.level}<br>
        👤 ${r.user}<br>
        👥 Joined: ${(r.joined || []).length}
        <br><br>
        <button onclick='joinRide("${r.id}", ${JSON.stringify(r).replace(/"/g,"&quot;")})'>
          Join Ride
        </button>
      </div>
    `;
  });
}

// 🚴 JOIN RIDE
window.joinRide = async (id, ride) => {
  if (!currentUser) return alert("Login first");

  const joined = ride.joined || [];

  if (!joined.includes(currentUser.email)) {
    joined.push(currentUser.email);
  }

  const { error } = await supabase
    .from("rides")
    .update({ joined })
    .eq("id", id);

  if (error) return alert(error.message);

  loadRides();
};

// Load rides on start
loadRides();