const { getGroupMembers, removeMember } = require('../controller/member');

module.exports = {
  /**
   * Retrieve the list of members of a group
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async getGroupMembers(req, res, next) {
    try {
      const listMembers = await getGroupMembers(req.params.groupId);
      return res.status(200).send(listMembers);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Remove a user from a group and return the new member list
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async removeFromGroup(req, res, next) {
    try {
      await removeMember(req.params.groupId, req.params.userId);
      await getGroupMembers(req.params.groupId);
    } catch (err) {
      next(err);
    }
  },
};
