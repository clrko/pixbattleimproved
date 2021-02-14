const { createNewGroup, getUserGroups, updateName, deleteGroup } = require('../models/group');
const { addUserToGroup } = require('../models/member');
const { sendInvitationMail } = require('../helper/sendInvitationMail');

module.exports = {
  /**
   * Create the group and send the invitation emails
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */

  async createGroupAndSendEmail(req, res, next) {
    try {
      // Create the group in the database
      const groupId = await createNewGroup(req.user.userId, req.body.groupName);

      // Insert the admin to the group
      await addUserToGroup(req.user.userId, groupId);

      // Send the email invitations to the admin's contacts
      const emails = req.body.emails;
      const username = req.user.username;
      sendInvitationMail(emails, username, groupId);

      return res.status(201).send({ groupId });
    } catch (err) {
      next(err);
    }
  },

  /**
   * remove one group
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */

  async deleteGroup(req, res, next) {
    try {
      await deleteGroup(req.params.groupId);
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Retrieve the information on all the groups of the user
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */

  async getUserGroups(req, res, next) {
    try {
      const userGroupInformation = await getUserGroups(req.user.userId);
      return res.status(200).send(userGroupInformation);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update the name of the group
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */

  async updateName(req, res, next) {
    try {
      await updateName(req.body.groupName, req.params.groupId);
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Invite new members to the group // ajouter a members
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */

  inviteMembers(req, res, next) {
    try {
      const emails = req.body.allEmails;
      const username = req.user.username;
      const groupId = req.params.groupId;
      sendInvitationMail(emails, username, groupId);
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },
};
