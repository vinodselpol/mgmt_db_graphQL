

const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType} = require('graphql')

// mongoose models
const Project = require('../models/Project')
const Client = require('../models/Client')


//Client Type

const ClientType = new GraphQLObjectType({
    name: 'client',
    fields:() =>({
        id:{type:GraphQLID},
        name:{type:GraphQLString},
        email:{type:GraphQLString},
        phone:{type:GraphQLString}
    })
})

//Project type

const ProjectType = new GraphQLObjectType({
    name: 'project',
    fields:() =>({
        id:{type:GraphQLID},
        client:{
            type: ClientType,
            resolve(parent, args){
                return Client.findById(parent.clientId)
            }
        },
        name:{type:GraphQLString},
        description:{type:GraphQLString},
        status:{type:GraphQLString}
    })

})

// rootQuery

const RootQuery = new GraphQLObjectType({
    name : 'RootQueryType',
    fields:{
        clients:{
            type: new GraphQLList(ClientType),
            resolve(parent, args){
                return Client.find();
            }

        },
        client:{
            type: ClientType,
            args:{id:{type:GraphQLID}},
            resolve(parent, args){
                return Client.findById(args.id)
            }
        },
        project:{
            type: ProjectType,
            args:{id:{type:GraphQLID}},
            resolve(parent, args){
                return Project.findById(args.id)
            }
        },
        projects:{
            type: new GraphQLList(ProjectType),
            resolve(parent, args){
                return Project.find();
            }
        }
    }
})

// Mutations

const mutation = new GraphQLObjectType ({
    name: 'Mutation',
    fields : {
        addClient: {
            type: ClientType,
            args:{
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                })
                return client.save()
            }
        },
        // Delete a client

        deleteClient: {
            type: ClientType,
            args:{
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent,args) {

                Project.find({ clientId: args.id }).then((projects) => {
                    projects.forEach((project) => {
                      project.deleteOne();
                    });
                  });
                return Client.findByIdAndRemove(args.id)
            }
        },

        //Add a Project
        addProject:{
            type: ProjectType,
            args:{
                name: {type: GraphQLNonNull(GraphQLString)},
                description: {type: GraphQLNonNull(GraphQLString)},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values:{
                            'new':{value: 'Not Started'},
                            'progress':{value:' In Progress'},
                            'completed':{value:' Completed'},
                        }
                    }),
                    defaultValue: 'Not Started',

                },
                clientId: {type: GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args) {
                const project = new Project({
                    name:args.name,
                    description:args.description,
                    status:args.status,
                    clientId:args.clientId,
                })
                return project.save()
            }
        },
        // Delete a project

        
        deleteProject: {
            type: ProjectType,
            args:{
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent,args) {
                return Project.findByIdAndRemove(args.id)
            }
        },

        // Update a project

        updateProject: {
            type: ProjectType,
            args:{
                id: {type: GraphQLNonNull(GraphQLID)},
                name:{type: GraphQLString},
                description:{type: GraphQLString},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values:{
                            'new':{value: 'Not Started'},
                            'progress':{value:' In Progress'},
                            'completed':{value:' Completed'},
                        }
                    }),
                },

            },
            resolve(parent, args){
                return Project.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name:args.name,
                            description:args.description,
                            status:args.status,
                        },
                    },
                    {new: true}
                )
            }
        }

        

       //
        
    }
});



module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
})