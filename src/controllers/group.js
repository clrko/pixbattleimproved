const {
  createNewGroup,
  addUserToGroup,
  getUserGroups,
  updateGroupName,
  deleteGroup,
  getGroupMembers,
  removeGroupMember,
} = require('../models/group');
const { getAllGroupPhotos } = require('../models/photo');
const { sendInvitationMail } = require('../helpers/sendInvitationMail');

module.exports = {
  async createGroupAndSendInvitationEmail(req, res, next) {
    try {
      const groupId = await createNewGroup(req.user.userId, req.body.groupName);

      await addUserToGroup(req.user.userId, groupId);

      const emails = req.body.emails;
      const username = req.user.username;
      sendInvitationMail(emails, username, groupId);

      return res.status(201).send({ groupId });
    } catch (err) {
      next(err);
    }
  },

  async deleteGroup(req, res, next) {
    try {
      await deleteGroup(req.params.groupId);
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

  async getUserGroups(req, res, next) {
    try {
      const userGroupInformation = await getUserGroups(req.user.userId);
      return res.status(200).send(userGroupInformation);
    } catch (err) {
      next(err);
    }
  },

  async updateGroupName(req, res, next) {
    try {
      await updateGroupName(req.body.groupName, req.params.groupId);
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

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

  async getGroupMembers(req, res, next) {
    try {
      const listMembers = await getGroupMembers(req.params.groupId);
      return res.status(200).send(listMembers);
    } catch (err) {
      next(err);
    }
  },

  async removeFromGroup(req, res, next) {
    try {
      await removeGroupMember(req.params.groupId, req.params.userId);
      await getGroupMembers(req.params.groupId);
    } catch (err) {
      next(err);
    }
  },

  async getAndSendAllGroupPhotos(req, res, next) {
    try {
      const groupId = [req.params.groupId];
      const photosGroupUrls = await getAllGroupPhotos(groupId);
      return res.status(200).send(photosGroupUrls);
    } catch (err) {
      next(err);
    }
  },
};
