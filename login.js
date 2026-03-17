function login() {

  const user = document.getElementById("usuario").value.trim();
  const pass = document.getElementById("password").value.trim();

  const usuarioCorrecto = "admin";
  const passwordCorrecta = "1234";

  if (user === usuarioCorrecto && pass === passwordCorrecta) {

    window.location.href = "admin.html?auth=ok";

  } else {
    document.getElementById("error").innerText = "Datos incorrectos";
  }
}