const Pacientes = require("../models/Pacientes");
const Usuarios = require("../models/Usuarios");
const Medicos = require("../models/Medico")
const Triagens = require("../models/Triagens")
const bcrypt = require("bcrypt");
const Joi = require("joi");
const db = require("../config/database");

