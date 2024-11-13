
# System Design - CRUD de Playlist no Spotify

## Índice

1.  [Visão Geral do Sistema](#vis%C3%A3o-geral-do-sistema)
2.  [Requisitos do Sistema](#requisitos-do-sistema)
3.  [Decisões Arquiteturais](#decis%C3%B5es-arquiteturais)
4.  [C4 Model - Level 1 (Contexto do Sistema)](#c4-model---level-1-contexto-do-sistema)
5.  [C4 Model - Level 2 (Container do Sistema)](#c4-model---level-2-container-do-sistema)
6.  [Padrões Arquiteturais](#padrões-arquiteturais)
7.  [Diagrama de Classes](#diagrama-de-classes)
8.  [Diagrama de Componentes](#diagrama-de-componentes)


## Visão Geral do Sistema

Este sistema foi projetado para gerenciar playlists de música para usuários da plataforma Spotify. A funcionalidade CRUD para playlists permite que os usuários criem novas playlists, visualizem playlists existentes, façam alterações, e excluam playlists indesejadas.

## Requisitos do Sistema

### Funcionais

-   Criar uma playlist com um nome e descrição.
-   Adicionar ou remover músicas da playlist.
-   Exibir informações da playlist para o usuário, incluindo lista de músicas.
-   Permitir que o usuário atualize informações da playlist.
-   Excluir playlists específicas.

### Não Funcionais

-   Escalabilidade para suportar milhões de usuários simultâneos.
-   Baixa latência para proporcionar uma experiência fluida.
-   Alta disponibilidade e tolerância a falhas para não interromper o serviço.
-   Segurança e controle de acesso para garantir que somente o proprietário possa modificar a playlist.

## Decisões Arquiteturais

### Estilos Arquiteturais

-   **Microserviços** para decompor o sistema em serviços menores e independentes.
-   **RESTful APIs** para comunicação entre os serviços.
-   **Event-Driven Architecture** para tratar atualizações de playlists e sincronizar dados em tempo real entre dispositivos.

### Padrões de Projeto

-   **Repository Pattern** para a camada de acesso a dados de playlists e músicas.
-   **DTO (Data Transfer Objects)** para transferir dados entre camadas.
-   **Factory Pattern** para instâncias complexas de playlist.

----------

## C4 Model - Level 1 (Contexto do Sistema)
´´´mermaid
C4Context

title Diagrama de Contexto do Sistema de Gerenciamento de Playlists

Enterprise_Boundary(b0, "Limite do Serviço de Streaming") {

  Person(user, "Usuário do Spotify", "Um usuário da plataforma que cria, gerencia e escuta playlists.")

  System(playlistSystem, "Sistema de Gerenciamento de Playlists", "Permite que os usuários criem, visualizem, editem e excluam playlists com suas músicas favoritas.")

  Enterprise_Boundary(b1, "Backend do Spotify") {

    SystemDb_Ext(mainMusicDatabase, "Banco de Dados Principal de Músicas", "Armazena todas as informações principais sobre músicas, álbuns e artistas disponíveis na plataforma.")
    
    System_Boundary(b2, "Limite de Gerenciamento de Usuários") {
      System(userAuthSystem, "Sistema de Autenticação de Usuários", "Gerencia o login de usuários e controle de acesso.")
      System(userProfileSystem, "Sistema de Perfil de Usuários", "Armazena dados específicos do usuário, como preferências e metadados das playlists.")
    }

    System_Ext(emailSystem, "Sistema de Notificações por E-mail", "Envia notificações para os usuários quando as playlists são modificadas.")
    
    Boundary(b3, "Limite de Streaming de Músicas", "limite") {
      SystemQueue(playbackQueue, "Fila de Reprodução de Músicas", "Gerencia solicitações de streaming de músicas.")
      SystemQueue_Ext(eventQueue, "Fila de Registro de Eventos", "Registra ações dos usuários, como edições de playlists para análise e personalização.")
    }
  }
}

BiRel(user, playlistSystem, "Usa")
BiRel(playlistSystem, mainMusicDatabase, "Busca metadados das músicas")
Rel(playlistSystem, emailSystem, "Envia notificações", "SMTP")
Rel(emailSystem, user, "Envia e-mails para")

UpdateElementStyle(user, $fontColor="black", $bgColor="lightyellow", $borderColor="black")
UpdateRelStyle(user, playlistSystem, $textColor="green", $lineColor="green", $offsetX="5")
UpdateRelStyle(playlistSystem, mainMusicDatabase, $textColor="blue", $lineColor="blue", $offsetY="-10")
UpdateRelStyle(playlistSystem, emailSystem, $textColor="blue", $lineColor="blue", $offsetY="-40", $offsetX="-50")
UpdateRelStyle(emailSystem, user, $textColor="purple", $lineColor="purple", $offsetX="-50", $offsetY="20")

UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")

´´´
----------

## C4 Model - Level 2 (Container do Sistema)
```mermaid
C4Container

title Diagrama de Container para o Sistema de Gerenciamento de Playlists

System_Ext(email_system, "Sistema de Notificações por E-mail", "Sistema interno de notificações via e-mail", $tags="v1.0")

Person(user, Usuário, "Um usuário da plataforma de streaming que cria, gerencia e escuta playlists", $tags="v1.0")

Container_Boundary(c1, "Sistema de Streaming de Música") {

  Container(web_app, "Aplicação Web", "JavaScript, React", "Permite ao usuário gerenciar playlists e acessar conteúdo musical via navegador")

  Container_Ext(mobile_app, "Aplicativo Móvel", "Kotlin, Swift", "Oferece funcionalidades de gerenciamento de playlists e reprodução para dispositivos móveis")

  Container(playlist_service, "Serviço de Gerenciamento de Playlists", "Java, Spring Boot", "Gerencia a criação, atualização e exclusão de playlists e a adição de músicas")

  ContainerDb(database, "Banco de Dados de Playlists", "PostgreSQL", "Armazena informações sobre playlists, incluindo músicas, metadata e preferências dos usuários")

  Container(api_gateway, "API Gateway", "NGINX, Docker", "Controla o tráfego de API e roteia solicitações para serviços backend apropriados")

}

System_Ext(music_catalog, "Catálogo de Músicas", "Armazena informações sobre músicas, álbuns e artistas disponíveis na plataforma")

Rel(user, web_app, "Usa", "HTTPS")
UpdateRelStyle(user, web_app, $offsetY="50", $offsetX="80")

Rel(user, mobile_app, "Usa", "HTTPS")
UpdateRelStyle(user, mobile_app, $offsetY="-40")

Rel(web_app, api_gateway, "Faz solicitações para")

Rel(mobile_app, api_gateway, "Faz solicitações para")

Rel(api_gateway, playlist_service, "Roteia solicitações para", "JSON/HTTPS")

Rel(playlist_service, database, "Lê e escreve em", "sync, JDBC")

Rel(playlist_service, email_system, "Envia notificações para", "sync, SMTP")
UpdateRelStyle(playlist_service, email_system, $offsetY="-50")

Rel(playlist_service, music_catalog, "Consulta informações de músicas", "async, REST API")
UpdateRelStyle(playlist_service, music_catalog, $offsetX="-120")

Rel(email_system, user, "Envia e-mails para")
UpdateRelStyle(email_system, user, $offsetX="-50")

UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```
---
## Padrões Arquiteturais

-   **Microserviços:** para dividir o sistema em serviços independentes e escaláveis.
-   **Event-Driven Architecture:** para sincronização em tempo real e notificação de atualizações em playlists.
-   **CQRS (Command Query Responsibility Segregation):** para otimizar comandos de criação e atualização, e consultas de leitura.
---
## Diagrama de Classes
```mermaid
classDiagram
    note "Diagrama de Classe com Vertical Slice e Clean Architecture"

    class Playlist {
        +UUID id
        +String nome
        +String descricao
        +UUID usuarioId
        +List~Musica~ musicas
    }

    note for Playlist "Entidade principal que representa uma playlist no domínio."

    class Musica {
        +UUID id
        +String titulo
        +String artista
        +String album
        +Integer duracao
    }

    note for Musica "Entidade de música que pertence a uma playlist."

    class CriarPlaylistUseCase {
        +criarPlaylist(nome: String, descricao: String, usuarioId: UUID): Playlist
    }

    note for CriarPlaylistUseCase "Caso de uso para criar uma nova playlist."

    class ObterPlaylistUseCase {
        +obterPlaylist(id: UUID): Playlist
    }

    note for ObterPlaylistUseCase "Caso de uso para obter uma playlist existente."

    class AtualizarPlaylistUseCase {
        +atualizarPlaylist(id: UUID, nome: String, descricao: String): Playlist
    }

    note for AtualizarPlaylistUseCase "Caso de uso para atualizar uma playlist."

    class DeletarPlaylistUseCase {
        +deletarPlaylist(id: UUID): Boolean
    }

    note for DeletarPlaylistUseCase "Caso de uso para deletar uma playlist."

    class PlaylistRepository {
        +criarPlaylist(playlist: Playlist): Playlist
        +obterPlaylistPorId(id: UUID): Playlist
        +atualizarPlaylist(playlist: Playlist): Playlist
        +deletarPlaylist(id: UUID): Boolean
    }

    note for PlaylistRepository "Repositório de persistência, responsável por interagir com o banco de dados."

    class PlaylistService {
        +criarPlaylist(nome: String, descricao: String, usuarioId: UUID): Playlist
        +obterPlaylist(id: UUID): Playlist
        +atualizarPlaylist(id: UUID, nome: String, descricao: String): Playlist
        +deletarPlaylist(id: UUID): Boolean
    }

    note for PlaylistService "Serviço de domínio que orquestra a execução dos casos de uso."

    Playlist "1" --> "*" Musica : Contém
    CriarPlaylistUseCase --> PlaylistRepository : Usa
    ObterPlaylistUseCase --> PlaylistRepository : Usa
    AtualizarPlaylistUseCase --> PlaylistRepository : Usa
    DeletarPlaylistUseCase --> PlaylistRepository : Usa
    PlaylistService --> CriarPlaylistUseCase : Usa
    PlaylistService --> ObterPlaylistUseCase : Usa
    PlaylistService --> AtualizarPlaylistUseCase : Usa
    PlaylistService --> DeletarPlaylistUseCase : Usa
```
---
## Diagrama de Componentes
```mermaid
C4Component
	title Diagrama de Componentes para Sistema de CRUD de Playlist - API Application

    Container(api, "API Application", "Java, Spring Boot", "Fornece todas as funcionalidades de internet banking por meio de uma API.")
    ContainerDb(db, "Database", "SQL Database", "Armazena as informações de playlists e músicas, autenticação de usuários, logs de acesso, etc.")

    Container_Boundary(playlist_api, "API de Playlist") {
        Component(criarPlaylist, "Criar Playlist Controller", "MVC Rest Controller", "Permite a criação de novas playlists.")
        Component(obterPlaylist, "Obter Playlist Controller", "MVC Rest Controller", "Permite a obtenção de playlists existentes.")
        Component(atualizarPlaylist, "Atualizar Playlist Controller", "MVC Rest Controller", "Permite a atualização de uma playlist existente.")
        Component(deletarPlaylist, "Deletar Playlist Controller", "MVC Rest Controller", "Permite a exclusão de uma playlist.")
        Component(servicoPlaylist, "Serviço de Playlist", "Spring Bean", "Orquestra os casos de uso de playlists (criar, obter, atualizar, deletar).")
        Component(playlistRepository, "Repositorio de Playlist", "Spring Bean", "Interage com o banco de dados para persistir as playlists.")

        Rel(criarPlaylist, servicoPlaylist, "Usa")
        Rel(obterPlaylist, servicoPlaylist, "Usa")
        Rel(atualizarPlaylist, servicoPlaylist, "Usa")
        Rel(deletarPlaylist, servicoPlaylist, "Usa")
        
        Rel(servicoPlaylist, playlistRepository, "Usa")
        Rel(playlistRepository, db, "Lê e grava", "JDBC")
    }

    Rel_Back(api, criarPlaylist, "Usa", "JSON/HTTPS")
    Rel(api, obterPlaylist, "Usa", "JSON/HTTPS")
    Rel(api, atualizarPlaylist, "Usa", "JSON/HTTPS")
    Rel(api, deletarPlaylist, "Usa", "JSON/HTTPS")

    UpdateRelStyle(api, criarPlaylist, $offsetY="-40")
    UpdateRelStyle(api, obterPlaylist, $offsetY="40")
    UpdateRelStyle(api, atualizarPlaylist, $offsetX="40", $offsetY="40")
    UpdateRelStyle(api, deletarPlaylist, $offsetX="-40", $offsetY="-40")

    UpdateRelStyle(criarPlaylist, servicoPlaylist, $offsetY="-40")
    UpdateRelStyle(obterPlaylist, servicoPlaylist, $offsetY="-30")
    UpdateRelStyle(atualizarPlaylist, servicoPlaylist, $offsetY="-20")
    UpdateRelStyle(deletarPlaylist, servicoPlaylist, $offsetY="-10")
```
## System Design
```mermaid
graph TD

    %% Frontend
    subgraph Frontend
        FrontendApp[App Web/Mobile] -->|Requisições HTTP| API[API Gateway]
    end

    %% API Gateway
    subgraph API_Gateway [API Gateway]
        API -->|Redireciona para| PlaylistCommand[Serviço de Comandos - Playlist]
        API -->|Redireciona para| PlaylistQuery[Serviço de Consultas - Playlist]
        API -->|Redireciona para| MusicQuery[Serviço de Consultas - Música]
    end

    %% Microservices de Playlist e Música
    subgraph PlaylistService [Microservice de Playlist]
        PlaylistCommand -->|Cria/Atualiza/Deleta| PlaylistDB[Banco de Dados da Playlist]
        PlaylistQuery -->|Consulta| PlaylistReadDB[Banco de Dados de Leitura da Playlist]
    end

    subgraph MusicService [Microservice de Música]
        MusicQuery -->|Consulta| MusicDB[Banco de Dados de Música]
    end

    %% Persistência
    subgraph Persistencia [Persistência]
        PlaylistDB -->|Armazena Dados| PlaylistData[Dados de Playlist]
        PlaylistReadDB -->|Armazena Dados de Leitura| PlaylistReadData[Dados de Leitura da Playlist]
        MusicDB -->|Armazena Dados| MusicData[Dados de Música]
    end

    %% Comunicação entre Microservices
    PlaylistCommand -->|Comando| MusicDB
    MusicQuery -->|Consulta| PlaylistReadDB

    %% Comunicação externa
    SystemDB[Spotify Main Database] -->|Interage com| PlaylistDB
    SystemDB -->|Interage com| MusicDB

    %% Estilos e aparência
    classDef default fill:#f9,stroke:#333,stroke-width:4px;
    class FrontendApp,API,API_Gateway,PlaylistCommand,PlaylistQuery,MusicQuery,PlaylistService,MusicService default;

```
