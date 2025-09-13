import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { isDev } from "src/common/utils/is-dev.util";

export const getGraphQLConfig = async (configService: ConfigService): Promise<ApolloDriverConfig> => {
    return {
        path: configService.getOrThrow<string>('GRAPHQL_PREFIX'),
        driver: ApolloDriver,
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        context: ({ req, res }) => ({ req, res }),
        playground: isDev(configService),
    }
}