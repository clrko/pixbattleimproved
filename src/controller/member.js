const { getList, remove } = require('../controller/member');

module.exports = {
  /**
   * Retrieve the list of members of a group
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async getList(req, res, next) {
    try {
      const listMembers = await getList(req.params.groupId);
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
  async remove(req, res, next) {
    try {
      await remove(req.params.groupId, req.params.userId);
      await getList(req.params.groupId);
    } catch (err) {
      next(err);
    }
  },
};
