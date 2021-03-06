import { getConnection } from "typeorm";
import { UserInputError } from "apollo-server-core";

import { getInterface } from "../../../databases";
import { getWorkspace } from "../../../services";
import { DataSource } from "../../../models/polyflow";
import logger, { categories } from "../../../logger";

const log = logger.child({
  category: categories.DATA_SOURCE
});

export default {
  addDataSource: async (_, { workspaceId, type, uri }, { req }) => {
    const workspace = await getWorkspace(req, workspaceId);

    const dbInterface = getInterface(type);
    const validConnection = await dbInterface.assertConnection(uri);

    if (!validConnection) {
      throw new UserInputError("Invalid URI for the chosen type");
    }

    try {
      const dataSource = await DataSource.create({ uri, type }).save();
      await getConnection()
        .createQueryBuilder()
        .relation(DataSource, "workspace")
        .of(dataSource)
        .set(workspace);

      return dataSource;
    } catch (e) {
      log
        .child({
          error: e,
          action: "adding_data_source"
        })
        .error("URI already registered in this workspace");
      throw new UserInputError("URI already registered in this workspace");
    }
  }
};
