import { Router } from "express";
import AuthMiddlware from "../middleware/auth.middleware.js";
import {
  getAllContacts,
  getContactsForDMList,
  searchContacts,
} from "../controllers/contact.controller.js";

const router = Router();

router.post("/search", AuthMiddlware, searchContacts);
router.get("/get-contacts-for-dm", AuthMiddlware, getContactsForDMList);
router.get("/get-all-contacts", AuthMiddlware, getAllContacts);

export default router;
